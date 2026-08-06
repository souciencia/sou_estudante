import { CardHeader } from "./card-header"
import { CardIconEnade } from "./card-icon-enade"
import { CardProgressBar } from "./card-progress-bar"
import { CardRoot } from "./card-root"
import { CardTags } from "./card-tags"

export const Card = Object.assign(CardRoot, {
    Header: CardHeader,  
    IconEnade: CardIconEnade,
    Tags: CardTags,
    ProgressBar: CardProgressBar,
})