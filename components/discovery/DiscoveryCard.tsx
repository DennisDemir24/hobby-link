'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { ArrowRight, TrendingUp, Flame, Image as ImageIcon, Users, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'

export interface TrendingHobby {
  id: number
  title: string
  description: string
  image: string
  category: string
  trendingFactor: string
  trendingPercentage: string
  tags: string[]
}

interface DiscoveryCardProps {
  hobby: TrendingHobby
  index: number
}

const DiscoveryCard = ({ hobby, index }: DiscoveryCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="border border-gray-100 hover:border-indigo-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
        <div className="relative h-48 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ImageIcon className="h-16 w-16 text-gray-300" />
            </div>
          ) : (
            <Image
              src={hobby.image}
              alt={hobby.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          )}
          <Badge className="absolute top-3 left-3 z-20 bg-white/80 text-indigo-700 backdrop-blur-sm hover:bg-white/90">
            {hobby.category}
          </Badge>
          <div className="absolute top-3 right-3 z-20">
            <Badge className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-indigo-600 border-indigo-100 font-medium px-2.5 py-1">
              <TrendingUp className="h-3 w-3 text-indigo-600" />
              {hobby.trendingPercentage}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="text-xl font-semibold group-hover:text-indigo-600 transition-colors">
            {hobby.title}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {hobby.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-1 mb-4">
            {hobby.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                #{tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Flame className="w-4 h-4 mr-1 text-amber-500" />
              <span>{hobby.trendingFactor}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>Growing</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              <span>Trending</span>
            </div>
          </div>
          
          <div className="h-[1px] w-full bg-gray-100 mb-4"></div>
          <Button variant="ghost" className="text-indigo-600 p-0 h-auto font-medium hover:bg-transparent hover:text-indigo-700 group/btn">
            Explore this hobby
            <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default DiscoveryCard
