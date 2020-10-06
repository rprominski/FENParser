import Piece from "../Piece/Piece";
import { PieceColor } from '../Piece/PieceColor';
import { PieceType } from "../Piece/PieceType";
import PositionParser from '../PositionGenerator/PositionGenerator';

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

export class FENError {
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
        return new FENError(`Color has to be one letter 'B' or 'W', but '${char}' occured`);
    }

    private getColonSeparatedParts(fen: string) {
        const parts = fen.split(":");

        if (parts.length !== 3) {
            return new FENError("Invalid fen: expected 3 parts splited by ':'");
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
            return new FENError("Bad field description: " + field)
        }
        parsedField.y = Math.ceil(fieldId / Math.floor(this.boardSize / 2)) - 1;
        parsedField.x = ((fieldId - 1) % Math.floor(this.boardSize / 2)) * 2 + (parsedField.y % 2 === 0 ? 1 : 0);
        return parsedField;
    }

    private parseOneColorFields(fieldsString: string) {
        const fields: Field[] = []
        const color = this.getPiecesListColor(fieldsString);
        if (color instanceof FENError) {
            color.message = `"In ${fieldsString}" ` + color.message
            return color;
        }

        for (const field of this.getArrayOfFields(fieldsString.substr(1))) {
            const parsedField = this.parseField(field);
            if (parsedField instanceof FENError) {
                return parsedField;
            }
            fields.push({ color: color, type: parsedField.type, x: parsedField.x, y: parsedField.y })
        }
        return fields;
    }

    parseFEN(fen: string) {
        let position = new PositionParser().getNewPosition(this.boardSize);
        const parts = this.getColonSeparatedParts(fen);
        if (parts instanceof FENError) {
            return parts;
        }
        let [color, fields, fields2] = parts;
        let oneColorFields = this.parseOneColorFields(fields);
        if (oneColorFields instanceof FENError) {
            return oneColorFields;
        }
        for (const field of oneColorFields) {
            position[field.y][field.x] = new Piece(field.type, field.color);
        }
        oneColorFields = this.parseOneColorFields(fields2);
        if (oneColorFields instanceof FENError) {
            return oneColorFields;
        }
        for (const field of oneColorFields) {
            position[field.y][field.x] = new Piece(field.type, field.color);
        }
        return { position: position, colorToMove: this.parseColor(color) } as GamePosition;
    }
}

