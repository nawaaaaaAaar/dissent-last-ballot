"""Mechanical extraction of OSM geometry; database remains ODbL."""
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path

root = ET.parse("data/delhi-osm.xml").getroot()
origin = (28.624, 77.221)
scale = 0.14
def project(lat, lon):
    return [round((lon-origin[1])*111320*math.cos(math.radians(origin[0]))*scale, 3),
            round((origin[0]-lat)*111320*scale, 3)]
nodes = {n.get("id"): project(float(n.get("lat")), float(n.get("lon"))) for n in root.findall("node")}
roads, buildings, parks = [], [], []
allowed = {"primary","secondary","tertiary","residential","unclassified","living_street","service","pedestrian","footway","path","steps"}
for w in root.findall("way"):
    tags = {t.get("k"): t.get("v") for t in w.findall("tag")}
    points = [nodes[n.get("ref")] for n in w.findall("nd") if n.get("ref") in nodes]
    if len(points) < 2:
        continue
    # Keep only the requested central-Delhi playable bounds.
    if not any(-123 < p[0] < 138 and -173 < p[1] < 207 for p in points):
        continue
    if tags.get("highway") in allowed:
        roads.append({"id":w.get("id"),"name":tags.get("name",""),"kind":tags["highway"],"points":points})
    elif "building" in tags and len(points)>3 and points[0] == points[-1]:
        # Underground stations are not surface walls or collision solids.
        if float(tags.get("layer","0")) < 0 or (
            tags.get("building:levels") == "0" and "building:levels:underground" in tags):
            continue
        buildings.append({"id":w.get("id"),"name":tags.get("name",""),"kind":tags["building"],"points":points,"height": min(15, max(3, float(tags.get("building:levels","2"))*2)) if tags.get("building:levels","2").isdigit() else 5})
    elif (tags.get("leisure") in {"park","garden"} or tags.get("landuse") in {"grass","forest"}) and len(points)>3 and points[0] == points[-1]:
        parks.append({"id":w.get("id"),"name":tags.get("name",""),"points":points})
out = {"attribution":"© OpenStreetMap contributors, ODbL 1.0", "origin":origin,"scale":scale,
       "bbox":[77.212,28.611,77.231,28.635],"retrieved":"2026-10-05","roads":roads,"buildings":buildings,"parks":parks}
Path("docs/delhi-map.json").write_text(json.dumps(out,separators=(",",":")))
print(f"{len(roads)} roads, {len(buildings)} footprints; scale {scale}")
