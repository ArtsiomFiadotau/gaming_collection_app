import { Models } from "react-native-appwrite";

export interface Category extends Models.Document {
    name: string;
    description: string;
}

export interface User extends Models.Document {
    userId: number;
    userName: string;
    email: string;
    avatarUrl: string;
    gamesNumber: number;
    gamesCompleted: number;
    ratingAverage: number;
    isModerator: boolean; 
}

export interface CollectionItem extends Models.Document {
    userId: number;
    gameId: number;
    isOWned: boolean;
    status: string;
    dateStarted: date;
    dateCompleted: date;
    rating: number;
 
}

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}


interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
}

interface CustomHeaderProps {
    title?: string;
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}

interface CreateUserParams {
    email: string;
    password: string;
    userName: string;
}

interface SignInParams {
    email: string;
    password: string;
}

interface GetMenuParams {
    category: string;
    query: string;
}