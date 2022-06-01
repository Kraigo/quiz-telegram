import { dirname } from "path";
import { DataSource } from "typeorm";
import { QuestionEntity, QuizEntity, UserEntity } from "./entities";
import { ChatEntity } from "./entities/chat";
import { isDebug } from "./utils";
const root = dirname(require.main.filename);

export const dataSourceFile = `${root}/../data.sqlite`;

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: dataSourceFile,
    synchronize: true,
    logging: isDebug,
    entities: [UserEntity, QuizEntity, QuestionEntity, ChatEntity]
});