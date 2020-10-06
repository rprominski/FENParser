import { PieceType } from './PieceType';
import { PieceColor } from "./PieceColor";
export default class Piece {
    type: PieceType;
    color: PieceColor;

    constructor(type: PieceType, color: PieceColor) {
        this.type = type;
        this.color = color;
    }
}