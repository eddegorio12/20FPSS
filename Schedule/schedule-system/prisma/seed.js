"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var pg_1 = require("pg");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new client_1.PrismaClient({ adapter: adapter });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var admin, teacher1, teacher2, section1, section2, mathTopic, scienceTopic, today, nextMonday, dateStr, nextTuesday, tuesdayStr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.findUnique({ where: { email: 'admin@example.com' } })];
                case 1:
                    admin = _a.sent();
                    if (!!admin) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Admin User',
                                email: 'admin@example.com',
                                role: client_1.Role.ADMIN,
                            },
                        })];
                case 2:
                    admin = _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, prisma.user.findUnique({ where: { email: 'john.doe@example.com' }, include: { teacherProfile: true } })];
                case 4:
                    teacher1 = _a.sent();
                    if (!!teacher1) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'John Doe',
                                email: 'john.doe@example.com',
                                role: client_1.Role.TEACHER,
                                teacherProfile: {
                                    create: {},
                                },
                            },
                            include: { teacherProfile: true },
                        })];
                case 5:
                    teacher1 = _a.sent();
                    _a.label = 6;
                case 6: return [4 /*yield*/, prisma.user.findUnique({ where: { email: 'jane.smith@example.com' }, include: { teacherProfile: true } })];
                case 7:
                    teacher2 = _a.sent();
                    if (!!teacher2) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Jane Smith',
                                email: 'jane.smith@example.com',
                                role: client_1.Role.TEACHER,
                                teacherProfile: {
                                    create: {},
                                },
                            },
                            include: { teacherProfile: true },
                        })];
                case 8:
                    teacher2 = _a.sent();
                    _a.label = 9;
                case 9: return [4 /*yield*/, prisma.section.findUnique({ where: { name: 'Grade 10-A' } })];
                case 10:
                    section1 = _a.sent();
                    if (!!section1) return [3 /*break*/, 12];
                    return [4 /*yield*/, prisma.section.create({ data: { name: 'Grade 10-A' } })];
                case 11:
                    section1 = _a.sent();
                    _a.label = 12;
                case 12: return [4 /*yield*/, prisma.section.findUnique({ where: { name: 'Grade 10-B' } })];
                case 13:
                    section2 = _a.sent();
                    if (!!section2) return [3 /*break*/, 15];
                    return [4 /*yield*/, prisma.section.create({ data: { name: 'Grade 10-B' } })];
                case 14:
                    section2 = _a.sent();
                    _a.label = 15;
                case 15: return [4 /*yield*/, prisma.topic.findFirst({ where: { name: 'Mathematics' }, include: { topicParts: true } })];
                case 16:
                    mathTopic = _a.sent();
                    if (!!mathTopic) return [3 /*break*/, 18];
                    return [4 /*yield*/, prisma.topic.create({
                            data: {
                                name: 'Mathematics',
                                topicParts: {
                                    create: [{ name: 'Part 1 - Algebra' }, { name: 'Part 2 - Geometry' }],
                                },
                            },
                            include: { topicParts: true },
                        })];
                case 17:
                    mathTopic = _a.sent();
                    _a.label = 18;
                case 18: return [4 /*yield*/, prisma.topic.findFirst({ where: { name: 'Science' } })];
                case 19:
                    scienceTopic = _a.sent();
                    if (!!scienceTopic) return [3 /*break*/, 21];
                    return [4 /*yield*/, prisma.topic.create({
                            data: {
                                name: 'Science',
                            },
                        })];
                case 20:
                    scienceTopic = _a.sent();
                    _a.label = 21;
                case 21:
                    today = new Date();
                    nextMonday = new Date();
                    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
                    dateStr = nextMonday.toISOString().split('T')[0];
                    nextTuesday = new Date(nextMonday);
                    nextTuesday.setDate(nextMonday.getDate() + 1);
                    tuesdayStr = nextTuesday.toISOString().split('T')[0];
                    // Create Schedules
                    console.log('Seeding schedules...');
                    // Math with Section 1 on Monday (Teacher 1)
                    return [4 /*yield*/, prisma.schedule.create({
                            data: {
                                date: new Date(dateStr),
                                startTime: new Date("".concat(dateStr, "T08:00:00.000Z")),
                                endTime: new Date("".concat(dateStr, "T09:30:00.000Z")),
                                roomNumber: 'Rm 101',
                                sectionId: section1.id,
                                topicId: mathTopic.id,
                                topicPartId: mathTopic.topicParts[0].id,
                                teacherId: teacher1.teacherProfile.id,
                                syncStatus: 'SYNCED',
                            }
                        })];
                case 22:
                    // Math with Section 1 on Monday (Teacher 1)
                    _a.sent();
                    // Science with Section 2 on Monday (Teacher 1)
                    return [4 /*yield*/, prisma.schedule.create({
                            data: {
                                date: new Date(dateStr),
                                startTime: new Date("".concat(dateStr, "T10:00:00.000Z")),
                                endTime: new Date("".concat(dateStr, "T11:30:00.000Z")),
                                roomNumber: 'Lab 1',
                                sectionId: section2.id,
                                topicId: scienceTopic.id,
                                teacherId: teacher1.teacherProfile.id,
                                syncStatus: 'PENDING',
                            }
                        })];
                case 23:
                    // Science with Section 2 on Monday (Teacher 1)
                    _a.sent();
                    // Math with Section 2 on Tuesday (Teacher 2)
                    return [4 /*yield*/, prisma.schedule.create({
                            data: {
                                date: new Date(tuesdayStr),
                                startTime: new Date("".concat(tuesdayStr, "T08:00:00.000Z")),
                                endTime: new Date("".concat(tuesdayStr, "T09:30:00.000Z")),
                                roomNumber: 'Rm 102',
                                sectionId: section2.id,
                                topicId: mathTopic.id,
                                topicPartId: mathTopic.topicParts[1].id,
                                teacherId: teacher2.teacherProfile.id,
                                syncStatus: 'FAILED',
                            }
                        })];
                case 24:
                    // Math with Section 2 on Tuesday (Teacher 2)
                    _a.sent();
                    console.log('Database seeded successfully!');
                    console.log('Test Accounts:');
                    console.log(' - admin@example.com (Admin)');
                    console.log(' - john.doe@example.com (Teacher 1)');
                    console.log(' - jane.smith@example.com (Teacher 2)');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error("SEED_ERROR:", e.message);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
