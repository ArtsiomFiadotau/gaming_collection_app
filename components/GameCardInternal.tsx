import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';

const GameCardInternal = ( {gameId, coverImage, title}: GameMyApi) => {

    return (
    <Link href={`/games/${gameId}`} asChild>
        <TouchableOpacity className="w-[30%]">
            <Image
                source={{
                    uri: coverImage
                        ?
                    `https:${coverImage}` 
                        : 'https://placehold.co/600x400/1a1a1a/ffffff.png'
                }}
                className="w-full h-52 rounded-lg"
                resizeMode="cover"
            />    
            <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>{title}</Text>
        </TouchableOpacity>    
    </Link>
  )
}

export default GameCardInternal