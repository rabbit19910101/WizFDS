import { Xb, Color } from '../primitives';
import { IdGeneratorService } from '@services/id-generator/id-generator.service'

export interface IOpen {
    id: string,
    uuid: string,
    idAC: number,
    color: Color,
    xb: Xb,
    surf_id: string
}

export class Open {
    private _id: string;
    private _uuid: string;
    private _idAC: number;
    private _color: Color;
    private _xb: Xb;
    private _surf_id: string;

    constructor(jsonString: string) {

        let base: IOpen;
        base = <IOpen>JSON.parse(jsonString);

        let idGeneratorService = new IdGeneratorService;

        this.id = base.id || '';
        this.uuid = base.uuid || idGeneratorService.genUUID();
        this.idAC = base.idAC || 0;
        this.color = base.color != undefined && typeof base.color === 'object' ? new Color(JSON.stringify(base.color)) : new Color(JSON.stringify('{}'), 'GREEN');
		this.xb = new Xb(JSON.stringify(base.xb), 'open') || new Xb(JSON.stringify({}), 'open');
        this.surf_id = base.surf_id || 'OPEN';
    }

    /**
     * Getter id
     * @return {string}
     */
	public get id(): string {
		return this._id;
	}

    /**
     * Setter id
     * @param {string} value
     */
	public set id(value: string) {
		this._id = value;
	}


    /**
     * Getter uuid
     * @return {string}
     */
	public get uuid(): string {
		return this._uuid;
	}

    /**
     * Setter uuid
     * @param {string} value
     */
	public set uuid(value: string) {
		this._uuid = value;
	}

    /**
     * Getter idAC
     * @return {number}
     */
	public get idAC(): number {
		return this._idAC;
	}

    /**
     * Setter idAC
     * @param {number} value
     */
	public set idAC(value: number) {
		this._idAC = value;
	}

    /**
     * Getter color
     * @return {Color}
     */
	public get color(): Color {
		return this._color;
	}

    /**
     * Setter color
     * @param {Color} value
     */
	public set color(value: Color) {
		this._color = value;
	}

    /**
     * Getter xb
     * @return {Xb}
     */
	public get xb(): Xb {
		return this._xb;
	}

    /**
     * Setter xb
     * @param {Xb} value
     */
	public set xb(value: Xb) {
		this._xb = value;
	}

    /**
     * Getter surf_id
     * @return {string}
     */
	public get surf_id(): string {
		return this._surf_id;
	}

    /**
     * Setter surf_id
     * @param {string} value
     */
	public set surf_id(value: string) {
		this._surf_id = value;
	}
    toJSON(): object {
        let open: object = {
            id: this.id,
            uuid: this.uuid,
            idAC: this.idAC,
            xb: this.xb.toJSON(),
            surf_id: this.surf_id
        };
        return open;
    }
}
