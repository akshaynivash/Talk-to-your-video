CREATE VECTOR INDEX segment_embedding IF NOT EXISTS
FOR (s:Segment) ON (s.embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 768,
    `vector.similarity_function`: 'cosine'
  }
};
