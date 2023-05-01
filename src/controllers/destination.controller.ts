import { Request, Response, Router } from "express";
import { faker } from "@faker-js/faker";
import { TravelModel } from "../model/travelInfo.js";

export class DestinationController {
    public router = Router();
    public path = "/destination";
    constructor() {
        this.router.get(this.path, this.get_cities);
        this.router.post(this.path, this.add_city);
        this.router.get(`${this.path}/:cityName`, this.get_city);
        this.router.patch(`${this.path}/:cityName`, this.update_city);
        this.router.delete(`${this.path}/:cityName`, this.delete_city);
        this.router.get("/populate", this.populate_db);
    }
    async add_city(req: Request, res: Response) {
        try {
            let data = new TravelModel(req.body);
            let result = await data.save();
            res.status(200);
            res.json(result);
        } catch (e: any) {
            res.status(400);
            res.json({ ok: false, error: e.toString() });
        }
    }
    async get_cities(req: Request, res: Response) {
        try {
            const perPage = Number(req.query.perPage || 20);
            const pageNumber = Number(req.query.page || 0);
            if (perPage > 20) {
                res.status(400);
                return res.json({
                    ok: false,
                    error: "cannot have more than 20 cities perPage",
                });
            }
            let data = await TravelModel.find({}, { city: 1, _id: 0 })
                .limit(perPage)
                .skip(perPage * pageNumber)
                .lean()
                .exec();
            return res.json(data);
        } catch (e: any) {
            res.status(400);
            res.json({ ok: false, error: e.toString() });
        }
    }

    async get_city(req: Request, res: Response) {
        try {
            const city = String(req.params.cityName);
            const data = await TravelModel.findOne(
                { city: city },
                { _id: 0, _v: 0 }
            )
                .lean()
                .exec();
            res.json(data);
        } catch (e: any) {
            res.status(400);
            res.json({ ok: false, error: e.toString() });
        }
    }

    async update_city(req: Request, res: Response) {
        try {
            const data = new TravelModel({
                city: String(req.params.cityName),
                ...req.body,
            });
            let error = data.validateSync();
            if (error) {
                res.status(422);
                res.json({ ok: false, message: error.toString() });
            }
            let old = await TravelModel.findOne({ city: data.city });
            if (!old) {
                res.status(404);
                return res.json({
                    ok: false,
                    message: `${data.city} doesn't exist in database cannot update it!`,
                });
            }
            old.attractions = data.attractions;
            old.transport = data.transport;
            old.weather = data.weather;
            old.cuisine = data.cuisine;
            await old.save();
            res.status(200);
            res.json({ message: "updated!" });
        } catch (e: any) {
            res.status(400);
            res.json({ ok: false, error: e.toString() });
        }
    }

    async delete_city(req: Request, res: Response) {
        try {
            let response = await TravelModel.deleteOne({ city: req.params.cityName });
            if(response.deletedCount === 0) {
                res.status(400);
                return res.json({ ok : false, error : `${req.params.cityName} not found in database cannot delete it!`});
            }
            res.json({ message: "done" });
        } catch (e: any) {
            res.status(400);
            res.json({ ok: false, error: e.toString() });
        }
    }

    async populate_db(req: Request, res: Response) {
        try {
            for (let i = 0; i < 100; i++) {
                const data = new TravelModel({
                    city: faker.address.cityName(),
                    attractions: [
                        faker.lorem.words(),
                        faker.lorem.words(),
                        faker.lorem.words(),
                    ],
                    transport: [
                        faker.lorem.word(),
                        faker.lorem.word(),
                        faker.lorem.word(),
                    ],
                    weather: faker.lorem.word(),
                    cuisine: [
                        faker.lorem.word(),
                        faker.lorem.word(),
                        faker.lorem.word(),
                    ],
                });
                await data.save();
            }
            res.json({ message: "done" });
        } catch (e: any) {
            res.status(400);
            res.json({ ok: false, error: e.toString() });
        }
    }
}
