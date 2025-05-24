from flask import Flask, request, jsonify, send_file
import os
import requests
import base64
import io
import json
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Google Cloud Vision API key
API_KEY = "AIzaSyBG2FtGOP2uE0qOgd3JLx5-9XnQlyHuNng"  # Your API key

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(image_path)

    # Process image with Vision API
    try:
        results, output_image_path = analyze_image(image_path, file.filename)
        return jsonify({
            "results": results,
            "image_url": f"/image/{os.path.basename(output_image_path)}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/image/<filename>')
def serve_image(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename))

def analyze_image(image_path, filename):
    # Read and encode image
    with io.open(image_path, 'rb') as image_file:
        content = image_file.read()
    encoded_image = base64.b64encode(content).decode('utf-8')

    # Vision API request
    url = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"
    payload = {
        "requests": [
            {
                "image": {"content": encoded_image},
                "features": [
                    {"type": "LABEL_DETECTION", "maxResults": 10},
                    {"type": "OBJECT_LOCALIZATION", "maxResults": 10}
                ]
            }
        ]
    }
    response = requests.post(url, json=payload)
    result = response.json()

    if response.status_code != 200 or 'error' in result:
        raise Exception(result.get('error', 'Unknown error'))

    # Extract labels and objects
    labels = result['responses'][0].get('labelAnnotations', [])
    objects = result['responses'][0].get('localizedObjectAnnotations', [])

    # Damage detection
    damage_indicators = ['Rubble', 'Demolition', 'Earthquake', 'Hazard']
    buildings = [obj for obj in objects if obj['name'].lower() == 'building']
    results = {"buildings": [], "labels": [], "sectors": []}

    # Load image for annotation
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()

    # Simulate geographic area
    lat_min, lat_max = 40.0, 40.1
    lon_min, lon_max = -74.0, -73.9

    # Process buildings
    for i, building in enumerate(buildings):
        has_damage = any(label['description'] in damage_indicators for label in labels)
        confidence = building['score']
        status = "Intact"
        box_color = "green"
        if has_damage and confidence > 0.6:
            status = "Collapsed"
            box_color = "red"
        elif has_damage:
            status = "Partially Damaged"
            box_color = "yellow"

        vertices = building['boundingPoly']['normalizedVertices']
        img_width, img_height = image.size
        box = [
            (vertices[0]['x'] * img_width, vertices[0]['y'] * img_height),
            (vertices[2]['x'] * img_width, vertices[2]['y'] * img_height)
        ]
        draw.rectangle(box, outline=box_color, width=3)
        draw.text((box[0][0], box[0][1] - 25), f"{status} ({confidence:.2%})", fill=box_color, font=font)

        center_x = (vertices[0]['x'] + vertices[2]['x']) / 2
        center_y = (vertices[0]['y'] + vertices[2]['y']) / 2
        lat = lat_min + (lat_max - lat_min) * center_y
        lon = lon_min + (lon_max - lon_min) * center_x

        results["buildings"].append({
            "building_id": i + 1,
            "status": status,
            "confidence": f"{confidence:.2%}",
            "lat": lat,
            "lon": lon
        })

    # Store labels with confidence
    results["labels"] = [{"description": label['description'], "score": f"{label['score']:.2%}"} for label in labels]

    # Sectorization (2x2 grid)
    lat_step = (lat_max - lat_min) / 2
    lon_step = (lon_max - lon_min) / 2
    for i in range(2):
        for j in range(2):
            bounds = [
                [lat_min + i * lat_step, lon_min + j * lon_step],
                [lat_min + (i + 1) * lat_step, lon_min + (j + 1) * lon_step]
            ]
            sector_buildings = [b for b in results["buildings"] if
                bounds[0][0] <= b["lat"] < bounds[1][0] and
                bounds[0][1] <= b["lon"] < bounds[1][1]
            ]
            priority = sum(3 if b["status"] == "Collapsed" else 1 if b["status"] == "Partially Damaged" else 0
                          for b in sector_buildings)
            results["sectors"].append({
                "sector_id": i * 2 + j + 1,
                "bounds": bounds,
                "priority": priority,
                "color": "red" if priority > 2 else "yellow" if priority > 0 else "green"
            })

    # Save annotated image
    output_image_path = os.path.join(UPLOAD_FOLDER, f"output_{filename}")
    image.save(output_image_path)

    # Print detailed output
    print("Detected Labels:")
    for label in labels:
        print(f"{label['description']}: {label['score']:.2%}")
    print("\nDetected Objects:")
    for building in buildings:
        print(f"Building: {building['score']:.2%}")
    print("\nDamage Analysis:")
    for building in results["buildings"]:
        print(f"Building {building['building_id']}: {building['status']} (Confidence: {building['confidence']}, Lat: {building['lat']:.4f}, Lon: {building['lon']:.4f})")
    print("\nSectors:")
    for sector in results["sectors"]:
        print(f"Sector {sector['sector_id']}: Priority {sector['priority']} (Color: {sector['color']})")

    return results, output_image_path

if __name__ == '__main__':
    app.run(debug=True, port=5000)