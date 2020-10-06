import Piece from '../Piece/Piece';
import { PieceType } from '../Piece/PieceType';
import { PieceColor } from '../Piece/PieceColor';

export default class PositionParser {

    constructor() {

    }

    getNewPosition(size: number) {
        let position: Piece[][] = [];

        for (let i = 0; i < size; i++) {
            let positionLine: Piece[] = [];
            for (let j = 0; j < size; j++) {
                positionLine.push(new Piece(PieceType.NONE, PieceColor.NONE));
            }
            position.push(positionLine);
        }
        return position;
    }

    getNewStartingPosition(size: number) {
        let position = this.getNewPosition(size);

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < size; j++) {
                if ((i + j) % 2 == 0) {
                    position[i][j].color = PieceColor.BLACK;
                    position[i][j].type = PieceType.MAN;
                }
            }
        }

        for (let i = size - 3; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if ((i + j) % 2 == 0) {
                    position[i][j].color = PieceColor.WHITE;
                    position[i][j].type = PieceType.MAN;
                }
            }
        }
        return position;
    }
}