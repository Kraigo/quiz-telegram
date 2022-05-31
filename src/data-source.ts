import { dirname } from "path";
import { DataSource } from "typeorm";
import { QuestionEntity, QuizEntity, UserEntity } from "./entities";
const root = dirname(require.main.filename);

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: `${root}/../data.sqlite`,
    synchronize: true,
    logging: true,
    entities: [UserEntity, QuizEntity, QuestionEntity]
});