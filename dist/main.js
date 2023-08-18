"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandline_interface_1 = __importDefault(require("./commandline-interface"));
const cli = new commandline_interface_1.default();
cli.playGame();
