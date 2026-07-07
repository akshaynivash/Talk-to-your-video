GRAPH_SCHEMA_DESCRIPTION = """
(:Video {id, title})-[:HAS_SEGMENT]->(:Segment {start, end, text, visual_description, embedding})
(:Segment)-[:MENTIONS]->(:Entity {name})
(:Segment)-[:MENTIONS]->(:Topic {name})
""".strip()
