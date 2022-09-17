const prompts = require("prompts");
const fetch = require("node-fetch");
const fs = require("fs");
let advanced = false;

(async () => {
    if (!fs.existsSync(__dirname + "\\advancedMode.json")) {
        const { advancedMode } = await prompts({
            name: "advancedMode",
            message: "Use advanced mode? (more options)",
            type: "select",
            choices: [
                { title: "No", value: false },
                { title: "Yes", value: true }
            ]
        });

        if (advancedMode) {
            fs.writeFileSync(__dirname + "\\advancedMode.json", "true");
            advanced = true;
        } else {
            fs.writeFileSync(__dirname + "\\advancedMode.json", "false");
            advanced = false;
        }
    } else {
        advanced = require(__dirname + "\\advancedMode.json")
    }

    const { token } = await prompts({
        name: "token",
        message: "Enter your applications token",
        type: "text"
    });

    const { id } = await prompts({
        name: "id",
        message: "Enter your applications id",
        type: "text"
    });

    let command = {};
    createCommand()
    async function createCommand() {
        const { commandName } = await prompts({
            name: "commandName",
            message: "Enter command name",
            type: "text"
        });
        command[commandName] = { options: {} };

        const { commandDescription } = await prompts({
            name: "commandDescription",
            message: "Enter command description",
            type: "text"
        });
        command[commandName]["description"] = commandDescription

        if (advanced) {
            const { commandType } = await prompts({
                name: "commandType",
                message: "Enter command type",
                type: "select",
                choices: [
                    { title: "Sub Command", value: 1 },
                    { title: "Sub Command Group", value: 2 },
                    { title: "String", value: 3 },
                    { title: "Integer", value: 4 },
                    { title: "Boolean", value: 5 },
                    { title: "User", value: 6 },
                    { title: "Channel", value: 7 },
                    { title: "Role", value: 8 },
                    { title: "Mentionable", value: 9 },
                    { title: "Number", value: 10 },
                    { title: "Attachment", value: 11 },
                ]
            });
            command[commandName]["type"] = commandType;
        }

        console.log("Command created, add options (press enter to skip)");

        createOption()
        async function createOption() {
            const { optionName } = await prompts({
                name: "optionName",
                message: "Enter option name",
                type: "text"
            });

            if (!optionName) {
                const { createAnotherCommand } = await prompts({
                    name: "createAnotherCommand",
                    message: "Create another command?",
                    type: "select",
                    choices: [
                        { title: "No", value: false },
                        { title: "Yes", value: true }
                    ]
                });

                if (createAnotherCommand) {
                    createCommand()
                } else {
                    addCommand(command)
                }
            } else {
                command[commandName]["options"][optionName] = {};

                const { optionDescription } = await prompts({
                    name: "optionDescription",
                    message: "Enter option description",
                    type: "text"
                });

                command[commandName]["options"][optionName]["description"] = optionDescription;

                const { optionRequired } = await prompts({
                    name: "optionRequired",
                    message: "Option is required?",
                    type: "select",
                    choices: [
                        { title: "No", value: false },
                        { title: "Yes", value: true }
                    ]
                });

                command[commandName]["options"][optionName]["required"] = optionRequired;

                if (advanced) {
                    const { optionType } = await prompts({
                        name: "optionType",
                        message: "Enter option type",
                        type: "select",
                        choices: [
                            { title: "String", value: 3 },
                            { title: "Integer", value: 4 },
                            { title: "Boolean", value: 5 },
                            { title: "User", value: 6 },
                            { title: "Channel", value: 7 },
                            { title: "Role", value: 8 },
                            { title: "Mentionable", value: 9 },
                            { title: "Number", value: 10 },
                            { title: "Attachment", value: 11 },
                            { title: "Sub Command", value: 1 },
                            { title: "Sub Command Group", value: 2 },
                        ]
                    });
                    command[commandName]["options"][optionName]["type"] = optionType;
                }

                const { createAnotherOption } = await prompts({
                    name: "createAnotherOption",
                    message: "Create another option?",
                    type: "select",
                    choices: [
                        { title: "No", value: false },
                        { title: "Yes", value: true }
                    ]
                });
                if (createAnotherOption) {
                    createOption()
                } else {
                    const { createAnotherCommand } = await prompts({
                        name: "createAnotherCommand",
                        message: "Create another command?",
                        type: "select",
                        choices: [
                            { title: "No", value: false },
                            { title: "Yes", value: true }
                        ]
                    });
                    if (createAnotherCommand) {
                        createCommand()
                    } else {
                        addCommand(command)
                    }
                }
            }
        }
    }

    async function addCommand(command) {
        let multipleCommands = false;
        let commands = Object.keys(command).length;
        if (commands > 1) {
            multipleCommands = true;
            console.log("Creating commands...");
        } else {
            console.log("Creating command...");
        }
        let commandsAdded = 0;

        singleCommand();
        async function singleCommand() {
            if (commandsAdded < commands) {
                let commandOptions = command[Object.keys(command)[commandsAdded]];

                let body = {
                    name: Object.keys(command)[commandsAdded],
                    description: commandOptions.description
                };
                if (commandOptions.type) {
                    body.type = commandOptions.type
                } else {
                    body.type = 1
                }

                if (commandOptions.options) {
                    body.options = [];
                    let optionsAdded = 0;
                    const options = Object.keys(commandOptions.options).length;

                    singleOption();
                    function singleOption() {
                        if (optionsAdded < options) {
                            let optionOptions = commandOptions.options[Object.keys(commandOptions.options)[optionsAdded]];

                            body.options.push({
                                name: Object.keys(commandOptions.options)[optionsAdded],
                                description: optionOptions.description,
                                required: optionOptions.required
                            });
                            if (optionOptions.type) {
                                body.options[optionsAdded].type = optionOptions.type
                            } else {
                                body.options[optionsAdded].type = 3
                            }

                            optionsAdded += 1;
                            singleOption()
                        } else {
                            post()
                        }
                    }
                } else {
                    post()
                }

                async function post() {
                    if (multipleCommands) console.log(`Creating command ${commandsAdded + 1} of ${commands}`)

                    await fetch(`https://discord.com/api/v10/applications/${id}/commands`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bot ${token}`
                        },
                        body: JSON.stringify(body)
                    }).then(discResp => discResp.json()).then(async discResp => {
                        if (discResp.id) {
                            commandsAdded += 1;
                            singleCommand()
                        } else {
                            console.log(`Error code: ${discResp.code}\nError Message: ${discResp.message}`);
                            const { continuePrompt } = await prompts({
                                name: "continuePrompt",
                                message: `Discord API Error occurred creating command "${body.name}", continue?`,
                                type: "select",
                                choices: [
                                    { title: "No", value: false },
                                    { title: "Yes", value: true }
                                ]
                            });

                            if (continuePrompt) {
                                commandsAdded += 1;
                                return singleCommand()
                            }
                        }
                    }).catch(async err => {
                        console.log("Error Message: " + err.message);
                        const { continuePrompt } = await prompts({
                            name: "continuePrompt",
                            message: `Request Error occurred creating command "${body.name}", continue?`,
                            type: "select",
                            choices: [
                                { title: "No", value: false },
                                { title: "Yes", value: true }
                            ]
                        });

                        if (continuePrompt) {
                            commandsAdded += 1;
                            return singleCommand()
                        }
                    });
                }
            } else {
                console.log("Completed!");
            }
        }
    }
})();