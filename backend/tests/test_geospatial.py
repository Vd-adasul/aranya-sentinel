import pytest
from geospatial.geo_utils import (
    haversine_distance_meters,
    polygon_centroid,
    polygon_area_hectares,
    point_in_polygon
)

def test_haversine_distance():
    # Distance between two known points in Agumbe
    d = haversine_distance_meters(13.5165, 75.0934, 13.5168, 75.0937)
    assert 30.0 < d < 60.0

def test_polygon_centroid():
    poly = [[75.088, 13.518], [75.096, 13.522], [75.099, 13.515], [75.092, 13.510], [75.088, 13.518]]
    lat, lng = polygon_centroid(poly)
    assert 13.510 < lat < 13.525
    assert 75.085 < lng < 75.100

def test_polygon_area_hectares():
    poly = [[75.088, 13.518], [75.096, 13.522], [75.099, 13.515], [75.092, 13.510], [75.088, 13.518]]
    area = polygon_area_hectares(poly)
    assert area > 10.0

def test_point_in_polygon():
    poly = [[75.0, 13.0], [75.1, 13.0], [75.1, 13.1], [75.0, 13.1], [75.0, 13.0]]
    assert point_in_polygon(75.05, 13.05, poly) is True
    assert point_in_polygon(75.25, 13.25, poly) is False

