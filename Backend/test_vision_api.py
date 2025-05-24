# import requests
# import base64
# import io
# import json
# from PIL import Image, ImageDraw, ImageFont

# # Your API key
# api_key = "AIzaSyBG2FtGOP2uE0qOgd3JLx5-9XnQlyHuNng"  # Replace with your actual API key

# # Path to your sample drone image
# image_path = "C:/Users/malch/Desktop/Google vision API Exmaple/deneme2.jpg"  # Assumes image is in backend/

# # Read and encode the image
# with io.open(image_path, 'rb') as image_file:
#     content = image_file.read()
# encoded_image = base64.b64encode(content).decode('utf-8')

# # Prepare the API request
# url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
# payload = {
#     "requests": [
#         {
#             "image": {
#                 "content": encoded_image
#             },
#             "features": [
#                 {"type": "LABEL_DETECTION", "maxResults": 10},
#                 {"type": "OBJECT_LOCALIZATION", "maxResults": 10}
#             ]
#         }
#     ]
# }

# # Send the request
# response = requests.post(url, json=payload)
# result = response.json()

# # Check for errors
# if response.status_code != 200 or 'error' in result:
#     print("Error:", result.get('error', 'Unknown error'))
#     exit()

# # Extract labels and objects
# labels = result['responses'][0].get('labelAnnotations', [])
# objects = result['responses'][0].get('localizedObjectAnnotations', [])

# # Damage detection logic
# damage_indicators = ['Rubble', 'Demolition', 'Earthquake', 'Hazard']
# buildings = [obj for obj in objects if obj['name'].lower() == 'building']
# results = []

# # Load the image for annotation
# image = Image.open(image_path)
# draw = ImageDraw.Draw(image)
# try:
#     font = ImageFont.truetype("arial.ttf", 20)  # Use a default font (Windows)
# except:
#     font = ImageFont.load_default()  # Fallback if font not found

# # Simulate a geographic area (1km x 1km, mapped to lat/lon)
# lat_min, lat_max = 40.0, 40.1  # Example latitude range
# lon_min, lon_max = -74.0, -73.9  # Example longitude range

# # Process each building
# for i, building in enumerate(buildings):
#     # Check for damage indicators
#     has_damage = any(label['description'] in damage_indicators for label in labels)
#     confidence = building['score']
    
#     # Classify damage
#     if has_damage and confidence > 0.6:
#         status = "Collapsed"
#         box_color = "red"
#     elif has_damage:
#         status = "Partially Damaged"
#         box_color = "yellow"
#     else:
#         status = "Intact"
#         box_color = "green"
    
#     # Get bounding box coordinates
#     vertices = building['boundingPoly']['normalizedVertices']
#     img_width, img_height = image.size
#     box = [
#         (vertices[0]['x'] * img_width, vertices[0]['y'] * img_height),
#         (vertices[2]['x'] * img_width, vertices[2]['y'] * img_height)
#     ]
    
#     # Draw rectangle and label
#     draw.rectangle(box, outline=box_color, width=3)
#     draw.text((box[0][0], box[0][1] - 25), f"{status} ({confidence:.2%})", fill=box_color, font=font)
    
#     # Map normalized coordinates to lat/lon (center of bounding box)
#     center_x = (vertices[0]['x'] + vertices[2]['x']) / 2
#     center_y = (vertices[0]['y'] + vertices[2]['y']) / 2
#     lat = lat_min + (lat_max - lat_min) * center_y
#     lon = lon_min + (lon_max - lon_min) * center_x
    
#     # Store results
#     results.append({
#         "building_id": i + 1,
#         "status": status,
#         "confidence": f"{confidence:.2%}",
#         "bounding_box": vertices,
#         "lat": lat,
#         "lon": lon
#     })

# # Save the annotated image
# output_image_path = "output_image.jpg"
# image.save(output_image_path)

# # Save results to JSON
# with open('results.json', 'w') as f:
#     json.dump({"buildings": results, "labels": [label['description'] for label in labels]}, f)

# # Print results
# print("Damage Analysis:")
# for building in results:
#     print(f"Building {building['building_id']}: {building['status']} (Confidence: {building['confidence']}, Lat: {building['lat']:.4f}, Lon: {building['lon']:.4f})")
# print("\nDetected Labels:", [label['description'] for label in labels])
# print(f"\nAnnotated image saved as: {output_image_path}")