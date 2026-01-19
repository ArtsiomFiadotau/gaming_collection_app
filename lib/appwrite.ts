import { CreateUserParams, SignInParams } from '@/types/type';
import { Databases } from 'react-native-appwrite';


export const createUser = async ({ email, password, userName }: CreateUserParams) => {
    try {
        const response = await fetch('https://gaming-collection-app-backend.onrender.com/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, userName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
       // return data; // Можно вернуть данные, если нужно
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
};

export const signIn = async ({ email, password }: SignInParams) => {  
try {
    const response = await fetch('https://gaming-collection-app-backend.onrender.com/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authorisation failed');
    }

    const data = await response.json();
} catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
}
};
    

// export const updateSearchCount = async (query: string, game: Game) => {
//     try {
 
    
    
//      const result = await tablesDB.listRows({
//          databaseId: DATABASE_ID,
//          tableId: TABLE_NAME, 
//          queries: [
//              Query.equal('searchTerm', query)
//          ]
//      });
 
//      if(result.total > 0) {
//          const existingGame = result.rows[0];
 
//          await tablesDB.updateRow({
//             databaseId: DATABASE_ID,
//             tableId: TABLE_NAME,
//              existingGame.$id,
//              {
//                  count: existingGame.count + 1
//              }
//             });
//      } else {
//          await tablesDB.createRow(DATABASE_ID, TABLE_NAME, ID.unique(), {
//              searchTerm: query,
//              gameId: game.id,
//              count: 1,
//              name: game.name,
//              cover_url: `https:${game.cover_url}`
//          })
 
//      }
 
//      console.log(result);
 
//  } catch (error) {
//      console.log(error);
//      throw error;
//  }
//      // проверяет сохранена ли запись текущего запроса
     
     
//      // если да, то дополняет существующую запись
//      //если нет, то создаёт новую запись в БД Appwrite и устанавливает число поисков - 1
     
//  }

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await Databases.listDocuments(
            appwrite.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        throw new Error (error as string);
    }
}