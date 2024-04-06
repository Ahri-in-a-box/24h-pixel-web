const Repository = require("./repository");
const Task = require("./task");
const { Workers } = require("./worker");
require("./array-extensions");

const apiUrl = process.env.API_URL;
const authUrl = process.env.AUTH_URL;
const id = process.env.ID;
const apiKey = process.env.KEY;

function processData(data) {
    const params = new URLSearchParams();
    Object.entries(data)
        .forEach(([key, val]) => params.append(key, val));

    return params;
}

class Api {
    repository = new Repository("persistence");
    workers = Workers;
    currentWorker = 0;
    token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ6MktTejRUcWdvMHkzQzZ3czBoRmQ2cXBjV241WEdueWRpUThRUWQtWWNzIn0.eyJleHAiOjE3MTI0Mjg2OTUsImlhdCI6MTcxMjQyMTQ5NSwianRpIjoiNjZiNDkyMDEtN2QxOC00MjMwLTgwYjctYWRkZDMyNzU3MTUzIiwiaXNzIjoiaHR0cDovLzE0OS4yMDIuNzkuMzQ6ODA4MS9yZWFsbXMvY29kZWxlbWFucyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI3NjhiOTMwMC02N2IwLTQzY2EtYjJiMS0xNDQwMTlhOWQ0NTEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwaXhlbC13YXIiLCJzZXNzaW9uX3N0YXRlIjoiN2EzYWIwNTUtZDQ5Ny00MWNhLTk0NmEtYTAxZjFjMGU0MGIxIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjgwODAiLCJodHRwOi8vMTQ5LjIwMi43OS4zNDo4MDgwIiwiaHR0cDovL2xvY2FsaG9zdDo0MjAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtY29kZWxlbWFucyIsInVtYV9hdXRob3JpemF0aW9uIiwidXNlciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsInNpZCI6IjdhM2FiMDU1LWQ0OTctNDFjYS05NDZhLWEwMWYxYzBlNDBiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSSdtIEFwcGxpICYgSSBrbm93IGl0IiwidGVhbV9pZCI6IjYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhcHBsaV9hbmRfa25vd19pdCIsImdpdmVuX25hbWUiOiJJJ20gQXBwbGkgJiBJIGtub3cgaXQifQ.gMJwLL9eokmAU7qd3vw14okE_XYL06I-haupQ74vXfOF1npp_vnWPmRMbtWXPAYzTiEkvjl3SxxayAyJZ1CZWxRyGC-salcgUHWBlhn7AD5VyMY0QpDKbmpz6VZh4PguY2cfzUovSowB7b6I4c4aiKa6yQhOgtNbKAdN5QS6N1upGvF0x9_4y2dMBIlww7GZmEGIMBZBlfivMqow9tr0FfGFRj5oPNJJzRt5FCmMqV1oQLVoEKhQgqMvTr-GnogWGz8on1mBN7C4xv1eBHCIQ7feSC3ll_lyUnsie7xkNsj42CSAJ6iZH0ge0gFN_ZTGMuwCV7egSPyjTZNj2MQWhg";

    async getToken() {
        const result = await fetch(authUrl, {
            body: processData({
                grant_type: "password",
                client_id: "pixel-war",
                username: id,
                password: apiKey
            }),
            headers: {
                "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            method: 'POST'
        });

        if(result.ok) {
            this.token = (await result.json()).access_token;
        }
    }

    async get(res, url) {
        const options = {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        };

        let result = await fetch(url, options);
        if(result.status == 403) {
            await this.getToken();
            options.headers.Authorization = `Bearer ${this.token}`;
            result = await fetch(url, options);
        }

        const message = result.headers.get("content-type")?.includes("application/json")
            ? await result.json() : await result.text();

        res.status(result.status)
            .send(message);
    }

    async post(signal, url, data) {
        const options = {
            body: JSON.stringify(data),
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`
            },
            signal
        };

        let result = await fetch(url, options);
        if(result.status == 403) {
            await this.getToken();
            options.headers.Authorization = `Bearer ${this.token}`;
            result = await fetch(url, options);
        }

        return result;
    }

    async getTeams(req, res) {
        const teamId = req.body.Id ?? req.body.Team ?? req.body.TeamId;
        const team = teamId ? `/${teamId}` : "";
        await this.get(res, `${apiUrl}/equipes${team}`);
    }

    async getCanvas(req, res) {
        const canvasId = req.body.Id ?? req.body.Canvas ?? req.body.CanvasId;

        if(canvasId == undefined) {
            res.status(400)
                .send("No canvas id provided.");
            return;
        }

        await this.get(res, `${apiUrl}/canvas/${canvasId}`);
    }

    async getCanvasSettings(req, res) {
        const canvasName = req.body.Name ?? req.body.Canvas ?? req.body.CanvasName;

        if(canvasName == undefined) {
            res.status(400)
                .send("No canvas name provided.");
            return;
        }

        await this.get(res, `${apiUrl}/pixels/${canvasName}/settings`);
    }

    async getCanvasImage(req, res) {
        const canvasId = req.body.Id ?? req.body.Canvas ?? req.body.CanvasId;

        if(canvasId == undefined) {
            res.status(400)
                .send("No canvas data id provided.");
            return;
        }

        const url = `${apiUrl}/pixels/${canvasId}/data`;
        const options = {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        };

        let result = await fetch(url, options);
        if(result.status == 403) {
            await this.getToken();
            options.headers.Authorization = `Bearer ${this.token}`;
            result = await fetch(url, options);
        }

        if(result.ok) {
            const data = await result.arrayBuffer();
            res.setHeader("Content-Type", result.headers.get("Content-Type"));
            res.setHeader("Content-Length", result.headers.get("Content-Type"));
            res.send(data);
        } else {
            const message = await result.text();
            res.status(result.status)
                .send(message);
        }
    }

    async getChunk(req, res) {
        const canvasId = req.body.Canvas ?? req.body.CanvasId;
        const chunkId = req.body.Chunk ?? req.body.ChunkId;

        if(canvasId == undefined || chunkId == undefined) {
            let message = "";

            if(!canvasId) {
                message += "No canvas id provided. "
            }

            if(!chunkId) {
                message += "No chunk id provided."
            }

            res.status(400)
                .send(message);
            return;
        }

        await this.get(res, `${apiUrl}/canvas/${canvasId}/chunks/${chunkId}`);
    }

    async getWorker(req, res) {
        const teamId = req.body.Team ?? req.body.TeamId;
        const workerId = req.body.Worker ?? req.body.WorkerId;

        if(teamId == undefined || workerId == undefined) {
            let message = "";

            if(!teamId) {
                message += "No team id provided. "
            }

            if(!workerId) {
                message += "No worker id provided."
            }

            res.status(400)
                .send(message);
            return;
        }

        await this.get(res, `${apiUrl}/equipes/${teamId}/workers/${workerId}`);
    }

    async getWorkerStatus(req, res) {
        const data = this.workers.map(worker => {
            const queue = worker.queue.filter(x => !x.ended).length;
            let lastUse = this.repository.get(worker.id);
            let cooldown = 0;
            if(lastUse) {
                lastUse = Date.parse(lastUse);
                cooldown = Math.max(((lastUse - Date.now()) / 1000) + 10, 0);
            }

            return { id: worker.id, free: queue == 0, cooldown, queue: queue };
        });

        res.status(200)
            .send(data);
    }

    async placePixel(req, res) {
        const data = {
            teamId: req.body.Team ?? req.body.TeamId,
            workerId: this.currentWorker,
            canvasName: req.body.Canvas ?? req.body.CanvasName,
            chunk: req.body.Chunk ?? req.body.ChunkId,
            color: req.body.Color,
            x: req.body.Pos?.X ?? req.body.X ?? req.body.PosX,
            y: req.body.Pos?.Y ?? req.body.Y ?? req.body.PosY
        };
        const params = {
            teamId: "No team id provided.",
            canvasName: "No canvas name provided.",
            chunk: "No chunk id provided.",
            color: "No color provided.",
            x: "No x axis position provided.",
            y: "No y axis position provided."
        };

        if(Object.keys(params).some(x => data[x] == undefined) || data.x < 0 || data.y < 0) {
            let message = Object.entries(params)
                .map(([key, val]) => data[key] == undefined ? val : "")
                .join(" ");

            if(data.x < 0 || data.y < 0) {
                message += " Invalid position.";
            }

            res.status(400)
                .send(message);

            return;
        }

        const task = new Task(async signal => {
            this.repository.addOrUpdate(data.workerId, new Date())
                .saveChanges();
            return await this.post(signal, `${apiUrl}/equipes/${data.teamId}/workers/${data.workerId + 251}/pixel`, {
                canvas: data.canvasName,
                chunk: data.chunk,
                color: data.color,
                pos_x: data.x,
                pos_y: data.y
            });
        });

        this.workers[data.workerId].addTask(task);
        this.currentWorker = (++this.currentWorker) % 50;

        res.status(200)
            .send(task.id);
    }

    async placePixels(pixels, chunk, canvas) {
        const data = pixels.map((x, i) => ({
            workerId: i % 50,
            teamId: 6,
            canvasName: canvas,
            chunk: chunk,
            color: x.color,
            pos_x: x.coord.x,
            pos_y: x.coord.y,
        }));

        data.forEach(x => {
            const task = new Task(async signal => {
                this.repository.addOrUpdate(x.workerId, new Date())
                    .saveChanges();
                return await this.post(signal, `${apiUrl}/equipes/${x.teamId}/workers/${x.workerId + 251}/pixel`, {
                    canvas: x.canvasName,
                    chunk: x.chunk,
                    color: x.color,
                    pos_x: x.pos_x,
                    pos_y: x.pos_y
                });
            });

            this.workers[x.workerId].addTask(task);
        });
    }

    async getWar(req, res) {
        const canvasId = req.body.Id ?? req.body.Canvas ?? req.body.CanvasId;

        if(canvasId == undefined) {
            res.status(400)
                .send("No canvas id provided.");
            return;
        }

        const options = {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        };

        let result = await fetch(`${apiUrl}/canvas/${canvasId}`, options);
        if(result.status == 403) {
            await this.getToken();
            options.headers.Authorization = `Bearer ${this.token}`;
            result = await fetch(url, options);
        }

        if(!result.ok) {
            res.status(result.status)
                .send(await result.text());
        }

        const canvas = await result.json();
        try {
            const promises = canvas.chunks.map(x => fetch(`${apiUrl}/canvas/${canvasId}/chunks/${x.id}`, options));
            const results = await Promise.all(promises);
            const chunks = (await Promise.all(results.map(x => x.json()))).flatMap(x => x.statistiquePixelPose);
            const total = chunks.sum(x => x.nombre);
            let teams = Object.values(chunks.groupBy(x => x.identifiantEquipe))
                .map(x => ({
                    id: x[0].identifiantEquipe,
                    name: x[0].nom,
                    pixels: x.sum(e => e.nombre)
                }))
                .sort((a, b) => b.pixels - a.pixels);

            const response = await fetch(`${apiUrl}/equipes`, options);
            let otherTeams = await response.json();
            otherTeams = otherTeams.filter(x => teams.find(t => t.id == x.id) == undefined)
                .map(x => ({
                    id: x.id,
                    name: x.nom,
                    pixels: 0
                }));

            teams = [...teams, ...otherTeams];

            res.status(200)
                .send(JSON.stringify({
                    totalPixels: total,
                    teams
                }));
        } catch(e) {
            res.status(400)
                .send(e);
        }
    }
}

module.exports = new Api();