"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Heart, MessageCircle, Smile, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Comment {
  id: number
  author: string
  avatar: string
  timestamp: string
  message: string
  likes: number
  replies: number
  isLiked: boolean
}

const mockComments: Comment[] = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "/diverse-woman-portrait.png",
    timestamp: "2:45 PM",
    message: "Really excited for this event! Will there be networking opportunities after the main session?",
    likes: 12,
    replies: 3,
    isLiked: false,
  },
  {
    id: 2,
    author: "Michael Rodriguez",
    avatar: "/man.jpg",
    timestamp: "3:12 PM",
    message: "Count me in! This is exactly what I needed to learn about.",
    likes: 8,
    replies: 1,
    isLiked: true,
  },
  {
    id: 3,
    author: "Emily Thompson",
    avatar: "/professional-woman.png",
    timestamp: "3:28 PM",
    message: "Is there a dress code for this event? Also, will food be provided?",
    likes: 5,
    replies: 2,
    isLiked: false,
  },
  {
    id: 4,
    author: "James Park",
    avatar: "/man-student.jpg",
    timestamp: "4:01 PM",
    message: "Looking forward to meeting everyone there! Let me know if anyone wants to grab coffee before.",
    likes: 15,
    replies: 5,
    isLiked: true,
  },
  {
    id: 5,
    author: "Olivia Martinez",
    avatar: "/woman-student.jpg",
    timestamp: "4:33 PM",
    message: "This looks amazing! Can we bring guests or is it limited to students only?",
    likes: 3,
    replies: 0,
    isLiked: false,
  },
]

export function CommentsThread() {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")

  const handleLike = (id: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    )
  }

  const handleSendComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: comments.length + 1,
        author: "You",
        avatar: "/abstract-geometric-shapes.png",
        timestamp: "Just now",
        message: newComment,
        likes: 0,
        replies: 0,
        isLiked: false,
      }
      setComments([...comments, newCommentObj])
      setNewComment("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendComment()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border bg-white px-6 py-4 shadow-sm">
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">Career Fair 2024: Tech Industry Networking</h1>
          <p className="text-sm text-muted-foreground">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </p>
        </div>
      </header>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-[#F9FAFB] p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {comment.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold text-foreground">{comment.author}</span>
                    <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-foreground">{comment.message}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-primary text-primary" : ""}`} />
                      <span className={comment.isLiked ? "text-primary font-medium" : ""}>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
                      <MessageCircle className="h-4 w-4" />
                      <span>{comment.replies}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t border-border bg-white px-6 py-4 shadow-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 hover:bg-muted">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border-input bg-[#F9FAFB] px-4 py-2 text-sm focus-visible:ring-primary"
          />
          <Button
            onClick={handleSendComment}
            disabled={!newComment.trim()}
            className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary p-0 hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
