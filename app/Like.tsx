'use client';

import { useState } from "react";

export function Like() {
  const [likes, setLikes] = useState(0);

  return <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>;
}
