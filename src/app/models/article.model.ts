// src/app/models/post.model.ts

export interface Article {
  id: string;
  slag: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  imageUrl: string;
}
