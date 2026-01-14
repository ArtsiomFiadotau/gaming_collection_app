import { CreateUserParams, SignInParams } from '@/types/type';
import { Account, Avatars, Client, ID, TablesDB } from 'react-native-appwrite';

export const appwriteConfig = {
endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
platform: "com.happycorp.gamingapp",
databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
userTableId: 'userid'
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
const avatars = new Avatars(client);

// const verifyConnection = async () => {
//     try {
//       const account = new Account(client);
//       await account.get(); // Попытка получить информацию аккаунта
//       console.log('✅Appwrite соединение успешно');
//     } catch (error) {
//       console.error('❌Ошибка соединения с Appwrite:', error);
//     }
//   };

//   verifyConnection();

export const createUser = async ({ email, password, name }: CreateUserParams) => {
        try {
            const newAccount = await account.create({userId: ID.unique(), email, password, name})
            if(!newAccount) throw Error;

            await signIn({email, password});

            const avatarUrl = avatars.getInitialsURL(name);

            return await tablesDB.createRow({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.userTableId,
                rowId: ID.unique(),
                data: { email, name, accountId: newAccount.$id, avatar: avatarUrl }
        });

    
        } catch (error) {
            throw new Error(error as string)
        }
}

export const signIn = async ({ email, password }: SignInParams) => {
        try {
            const session = await account.createEmailPasswordSession(email, password);
        } catch (error) {
            throw new Error(error as string)
        }

}

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