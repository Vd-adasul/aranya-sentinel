import math
from typing import List, Tuple

EARTH_RADIUS_METERS = 6378137.0

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS points in meters.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(EARTH_RADIUS_METERS * c, 2)

def polygon_centroid(coords: List[List[float]]) -> Tuple[float, float]:
    """
    Computes geographic centroid [lat, lon] from GeoJSON coordinates [[lon, lat], ...].
    """
    if not coords:
        return 0.0, 0.0

    pts = coords[:-1] if coords[0] == coords[-1] and len(coords) > 1 else coords
    avg_lon = sum(p[0] for p in pts) / len(pts)
    avg_lat = sum(p[1] for p in pts) / len(pts)
    return round(avg_lat, 6), round(avg_lon, 6)

def polygon_area_hectares(coords: List[List[float]]) -> float:
    """
    Computes exact spherical surface area of a polygon in hectares.
    Input coords: [[lon, lat], ...]
    """
    if len(coords) < 3:
        return 0.0

    n = len(coords)
    if coords[0] == coords[-1]:
        n -= 1

    area = 0.0
    for i in range(n):
        p1 = coords[i]
        p2 = coords[(i + 1) % n]
        lon1 = math.radians(p1[0])
        lat1 = math.radians(p1[1])
        lon2 = math.radians(p2[0])
        lat2 = math.radians(p2[1])
        area += (lon2 - lon1) * (2.0 + math.sin(lat1) + math.sin(lat2))

    area = abs(area * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS / 2.0)
    return round(area / 10000.0, 2)

def point_in_polygon(lon: float, lat: float, coords: List[List[float]]) -> bool:
    """
    Determines if point [lon, lat] is inside polygon using ray-casting algorithm.
    """
    if len(coords) < 3:
        return False

    pts = coords[:-1] if coords[0] == coords[-1] and len(coords) > 1 else coords
    n = len(pts)
    inside = False

    p1x, p1y = pts[0]
    for i in range(n + 1):
        p2x, p2y = pts[i % n]
        if lat > min(p1y, p2y):
            if lat <= max(p1y, p2y):
                if lon <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (lat - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or lon <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside

