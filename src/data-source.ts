import { dirname } from "path";
import { DataSource } from "typeorm";
import { QuestionEntity, QuizEntity, UserEntity } from "./entities";
import { isDebug } from "./utils";
const root = dirname(require.main.filename);

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: `${root}/../data.sqlite`,
    synchronize: true,
    logging: isDebug,
    entities: [UserEntity, QuizEntity, QuestionEntity]
});