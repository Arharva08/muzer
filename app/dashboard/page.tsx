"use client"

import { Button } from "@/components/ui/button"
import type React from "react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
//@ts-ignore
import { ThumbsUp, ThumbsDown, Play, Share2, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import axios from "axios";

interface Video {
  id: string
  title: string
  link: string
  upvotes: number
  downvotes: number
}
const REFRESH_INTERVAL_MS = 10*1000;

export default function Component() {
  const [inputLink, setInputLink] = useState("")
  const [queue, setQueue] = useState<Video[]>([
    { id: "1", title: "Awesome Song 1", link: "https://www.youtube.com/watch?v=abc123", upvotes: 0, downvotes: 0 },
    { id: "2", title: "Awesome Song 1", link: "https://www.youtube.com/watch?v=GhH1QWY6BDc&t=7353s", upvotes: 0, downvotes: 0 }
    //{ id: "2", title: "Cool Song 2", link: "https://www.youtube.com/watch?v=def456", upvotes: 3, downvotes: 0 },
    //{ id: "3", title: "Top Hit 2025", link: "https://www.youtube.com/watch?v=ghi789", upvotes: 2, downvotes: 1 },
  ])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [isCopied, setIsCopied] = useState(false)


  async function refreshStreams(){
    const res = await axios.get('/api/streams/my')
    console.log(res);
  }

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {

    }, REFRESH_INTERVAL_MS) 
  },[])

  useEffect(() => {
    if (currentVideo) {
      const timer = setTimeout(() => playNext(), 5000) // Simulate song ending after 5s
      return () => clearTimeout(timer)
    }
  }, [currentVideo])

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "/placeholder.svg"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputLink.trim()) return

    const newVideo: Video = {
      id: String(queue.length + 1),
      title: `New Song ${queue.length + 1}`,
      link: inputLink,
      upvotes: 0,
      downvotes: 0,
    }

    setQueue([...queue, newVideo])
    setInputLink("")
  }

  // const handleVote = (id: string, isUpvote: boolean) => {
  //   setQueue((prevQueue) =>
  //     prevQueue
  //       .map((video) =>
  //         video.id === id
  //           ? {
  //               ...video,
  //               upvotes: isUpvote ? video.upvotes + 1 : video.upvotes,
  //               downvotes: !isUpvote ? video.downvotes + 1 : video.downvotes,
  //             }
  //           : video
  //       )
  //       .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)))
  //       fetch("/api/streams/upvote",{
  //           body:JSON.stringify({
  //               streamId :id
  //           })
  //       })
  // }

  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue((prevQueue) =>
      prevQueue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes,
                downvotes: !isUpvote ? video.downvotes + 1 : video.downvotes,
              }
            : video
        )
        .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    );
  
    // ✅ Ensure correct method and headers
    fetch("/api/streams/upvote", {
      method: "POST",  // Ensure POST method
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        streamId: id,
      }),
    }).catch((error) => console.error("Error voting:", error)); // Catch errors
  };
  

  const playNext = () => {
    if (queue.length > 0) {
      setCurrentVideo(queue[0])
      setQueue(queue.slice(1))
    } else {
      setCurrentVideo(null)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Music Queue",
          text: "Check out this music queue!",
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setIsCopied(true)
        toast("Link copied to clipboard!", {
          description: "Share this link with your fans",
        })
        setTimeout(() => setIsCopied(false), 2000)
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Share Button */}
      <div className="flex justify-end">
        <Button onClick={handleShare} className="bg-indigo-600 hover:bg-indigo-700 text-white" variant="outline">
          {isCopied ? (
            <>
              <Check className="w-5 h-5 mr-2" /> Copied!
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5 mr-2" /> Share with fans
            </>
          )}
        </Button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Paste YouTube link"
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          className="w-full px-4 py-2 text-black bg-white rounded"
        />
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          Add to Queue
        </Button>
      </form>

      {/* Video Preview */}
      {inputLink && (
        <Card className="bg-gray-800">
          <CardContent className="p-4">
            <img src={getYouTubeThumbnail(inputLink)} alt="Video preview" className="w-full h-40 object-cover rounded" />
            <p className="mt-2 text-center">Video Preview</p>
          </CardContent>
        </Card>
      )}

      {/* Current Playing Video */}
      {currentVideo && (
        <Card className="bg-gray-800">
          <CardContent className="p-4 flex flex-col items-center space-y-2">
            <h2 className="text-xl font-bold">Now Playing</h2>
            <h3 className="text-lg">{currentVideo.title}</h3>
            <Button onClick={playNext} className="bg-red-600 hover:bg-red-700">
              <Play className="w-5 h-5 mr-2" /> Play Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Song Queue */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upcoming Songs</h2>
        {queue.length === 0 && <p className="text-gray-400">No songs in queue.</p>}
        {queue.map((video) => (
          <Card key={video.id} className="bg-gray-800 hover:bg-gray-700 transition duration-200">
            <CardContent className="p-4 flex flex-col md:flex-row items-center space-x-4">
              <img src={getYouTubeThumbnail(video.link)} alt={`Thumbnail for ${video.id}`} className="w-30 h-20 object-cover rounded" />
              <div className="flex-grow">
                <h3 className="font-semibold">{video.title}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <Button variant="outline" size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleVote(video.id, true)}>
                    <ThumbsUp className="w-4 h-4 mr-1" /> {video.upvotes}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleVote(video.id, false)}>
                    <ThumbsDown className="w-4 h-4 mr-1" /> {video.downvotes}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Play Next Button */}
      {queue.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={playNext} className="bg-blue-500 hover:bg-blue-600">
            <Play className="w-5 h-5 mr-2" /> Play Next Song
          </Button>
        </div>
      )}
    </div>       
  )
}
