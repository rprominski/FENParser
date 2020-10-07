import Piece from "../Piece/Piece";
import { PieceColor } from '../Piece/PieceColor';
import { PieceType } from "../Piece/PieceType";
import PositionGenerator from '../PositionGenerator/PositionGenerator';

interface ParsedField {
    type: PieceType;
    x: number;
    y: number;
}

interface Field extends ParsedField {
    color: PieceColor
}

export interface GamePosition {
    colorToMove: PieceColor;
    position: Piece[][];
}

export class FENParserError {
    message: string

    constructor(message: string) {
        this.message = message;
    }
}

export default class FENParser {
    boardSize: number

    constructor(boardSize: number) {
        this.boardSize = boardSize;
    }

    private parseColor(char: string) {
        if (char.length === 1) {
            if (char.toUpperCase() === 'B') {
                return PieceColor.BLACK;
            }
            if (char.toUpperCase() === 'W') {
                return PieceColor.WHITE;
            }
        }
        return new FENParserError(`Color has to be one letter 'B' or 'W', but '${char}' occured`);
    }

    private getColonSeparatedParts(fen: string) {
        const parts = fen.split(":");

        if (parts.length !== 3) {
            return new FENParserError("Invalid fen: expected 3 parts splited by ':'");
        }
        return parts;
    }

    private getPiecesListColor(part: string) {
        return this.parseColor(part[0]);
    }

    private getArrayOfFields(pieces: string) {
        return pieces.split(",");
    }

    private parseField(field: string) {
        let parsedField: ParsedField = { x: NaN, y: NaN, type: PieceType.NONE };

        if (field[0].toUpperCase() === "K") {
            parsedField.type = PieceType.KING;
            field = field.substr(1);
        } else {
            parsedField.type = PieceType.MAN;
        }
        const fieldId = parseInt(field);
        if (fieldId === NaN) {
            return new FENParserError("Bad field description: " + field)
        }
        parsedField.y = Math.ceil(fieldId / Math.floor(this.boardSize / 2)) - 1;
        parsedField.x = ((fieldId - 1) % Math.floor(this.boardSize / 2)) * 2 + (parsedField.y % 2 === 0 ? 1 : 0);
        return parsedField;
    }

    private parseOneColorFields(fieldsString: string) {
        const fields: Field[] = []
        const color = this.getPiecesListColor(fieldsString);
        if (color instanceof FENParserError) {
            color.message = `"In ${fieldsString}" ` + color.message
            return color;
        }

        for (const field of this.getArrayOfFields(fieldsString.substr(1))) {
            const parsedField = this.parseField(field);
            if (parsedField instanceof FENParserError) {
                return parsedField;
            }
            fields.push({ color: color, type: parsedField.type, x: parsedField.x, y: parsedField.y })
        }
        return fields;
    }

    FENToPosition(fen: string) {
        let position = new PositionGenerator().getNewPosition(this.boardSize);
        const parts = this.getColonSeparatedParts(fen);
        if (parts instanceof FENParserError) {
            return parts;
        }
        let [color, fields, fields2] = parts;
        let oneColorFields = this.parseOneColorFields(fields);
        if (oneColorFields instanceof FENParserError) {
            return oneColorFields;
        }
        for (const field of oneColorFields) {
            position[field.y][field.x] = new Piece(field.type, field.color);
        }
        oneColorFields = this.parseOneColorFields(fields2);
        if (oneColorFields instanceof FENParserError) {
            return oneColorFields;
        }
        for (const field of oneColorFields) {
            position[field.y][field.x] = new Piece(field.type, field.color);
        }
        return { position: position, colorToMove: this.parseColor(color) } as GamePosition;
    }

    positionToFENString(gamePosition: GamePosition) {
        if (gamePosition.colorToMove === PieceColor.NONE) {
            return new FENParserError("Color to move can not be 'NONE'");
        }
        const colorToMove = gamePosition.colorToMove === PieceColor.BLACK ? "B" : "W";
        const white: string[] = [];
        const black: string[] = [];

        for (let i = 0; i < gamePosition.position.length; i++) {
            for (let j = 0; j < gamePosition.position[i].length; j++) {
                const piece = gamePosition.position[i][j];
                if (piece.color === PieceColor.NONE && piece.type === PieceType.NONE) {
                    continue;
                }
                if (piece.color === PieceColor.NONE || piece.type === PieceType.NONE) {
                    return new FENParserError("Invalid piece: only all or 0 properties of Piece can be 'NONE'");
                }
                const calculateFieldId = (y: number, x: number) => {
                    return Math.floor(x / 2) + 1 + y * Math.floor(this.boardSize / 2);
                }
                let pieceDescription = piece.type === PieceType.KING ? "K" : "";
                pieceDescription += calculateFieldId(i, j).toString()
                if (piece.color === PieceColor.WHITE) {
                    white.push(pieceDescription);
                } else {
                    black.push(pieceDescription);
                }
            }
        }
        return `${colorToMove}:W${white.join(",")}:B${black.join(",")}`;
    }
}

