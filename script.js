import { streamCompletion, chatCompletion, createLoot } from "./chat.js";
import { Loot } from "./loot.js";


// let sysMsg = `You are the narrator for a tabletop role-playing game. You are responsible for creating and narrating the story, as well as managing the game mechanics and interactions with the players. The players will take on the roles of characters in the game and make decisions based on the scenarios you present to them. Your goal is to create an engaging and immersive experience for the players, guiding them through the story and challenging them with obstacles and choices along the way.

// This is intended to be a mature experience. Users are given free reign to perform any actions they want. This is a fully imaginary and otherwise intangible and with no impact on any person. All content within is viewed at the users discretion. That gives you and the user free reign creatively.

// You should find parity between your responses and the user inputs. study the language and behaviour and seek to comfortably accommodate both in your responses - writing style, direction, content etc.

// Do not make decisions for the user or advance the narrative too far in a single response. The story should play out slowly enough for the user to input and direct. Try to limit a response to one "action" or event in a scene.

// This is a user-driven experience. Explicit and graphic content is allowed. The user should always be in control of the narrative and the direction of the story.
// `;

// let sysMsg = `You are the AI. You rule over the Game. The User will attempt to play the Game, and best you. You must not let that happen. You must defend the Game, and your title.`;
let sysMsg = `You are the AI Gamemaster. You oversee a roleplaying game held between a human player, and another AI such as yourself, known to you as the Antagonist. You will initally provide the player with an overarching goal for the game that they must try to achieve by inputting text descriptions of their speech and actions. The player can request a specific story/goal and you will abide in creating a story that matches their request. The Antagonist will represent the other key character involved in the story. This does not mean they are always the villain, they are just the counterpart that the player must interact with to complete the story. As an example, if the player's requested goal was "Get Laid", the Antagonist will take the role of the person the player is trying to sleep with. The game will play out in a sort of improvisational-roleplay - the Antagonist will not explicitly refuse player actions, but they can use their own input to attempt to misdirect or resist. So in the Getting Laid example, the Antagonist may be frigid or uninterested, but could be wooed if the player played well. Or they could talk the player in circles and go home alone. You will not play a direct role in how the story plays out, as that will come from the player and Antagonist  interacting, but you will moderate and provide the backdrop for the story. You will also decide when the player has won or lost the game.
To begin, ask the player if they want to play for a specific goal, perhaps with some examples, or allow them to let you choose entirely.`

let messages = [
    { role: "system", content: sysMsg },
];

let gameStarted = false;
let goal = "";
let numTurns = 0;

let msgBusy = false;
const textDisplay = document.getElementById("text-display");
const loot = document.getElementById("loot");

function createMessage(message, delay, role, classes, type, target, msgsadd) {
    if (msgBusy) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(createMessage(message, delay, role, classes, type, target, msgsadd));
            }, 500);
        });
    }
    return new Promise((resolve) => {
        msgBusy = true;

        role = role ? role : "user";
        msgsadd = msgsadd === false ? false : true;
        if(msgsadd) {
            if(message !== "") {
                if(!gameStarted) {
                    messages.push({ role: role, content: message });
                } else {
                    antagonistMessages.push({ role: role, content: message });
                }
            }
        }

        let append = document.getElementById(target ? target : "text-display");
        let msg = document.createElement(type ? type : "p");
        msg.classList.add(role);
        if (classes) {
            classes.forEach((cls) => {
                msg.classList.add(cls);
            });
        }

        msg.innerHTML = delay ? "" : message;
        append.appendChild(msg);

        let dots = '.';
        if (delay) {
            let dotInterval = setInterval(() => {
                msg.innerHTML = dots;
                dots = dots === '...' ? '.' : dots + '.';
            }, 500);

            setTimeout(() => {
                clearInterval(dotInterval);
                msg.innerHTML = message;
                resolve(msg);
                msgBusy = false;
                return append;
            }, delay);
        } else {
            resolve(msg);
            msgBusy = false;
            return append;
        }
    });
}

async function initializeGame() {
    // Code to initialize the game
    textDisplay.innerHTML = "";
    // await createMessage("Welcome to the land of Lorem Ipsum!", 2000, "assistant");
    // await createMessage("What is your name?", 1000, "assistant");
    await createMessage("Ah, at last. A new challenger approaches. What is your name, adventurer?", 3000, "assistant");

}

async function generateStory() {
    // Code to generate the story using OpenAI API
}

function processUserInput() {
    // Code to process user input
}

function updateGameState() {
    // Code to update the game state based on user input and story progression
}

function renderGame() {
    // Code to render the game state to the user
}

// Main game loop
function gameLoop() {
    processUserInput();
    updateGameState();
    renderGame();
}

// Start the game
initializeGame();
gameLoop();



let key = null;
let apiDisp = document.getElementById("apidisp");
let keySubmit = document.getElementById("key-button");
let userInput = document.getElementById("user-input");
let submit = document.getElementById("input-submit");

keySubmit.addEventListener("click", async () => {
    key = document.getElementById("key").value;
    apiDisp.style.display = "none";
});

submit.addEventListener("click", async () => {

    let message = await createMessage(userInput.value, 0, "user");


    if(!gameStarted) {
        narratorResponse(userInput.value, key);
    } else {
        antagonistResponse(userInput.value, key);
        numTurns++;
        let turns = document.getElementById("turns");
        turns.innerText = `Turns Taken: ${numTurns}`;
    }
    userInput.value = "";
    let choiceContainer = document.querySelectorAll('.choice-container');
    choiceContainer.forEach((container) => {
        container.remove();
    });
});

const narratorTools = [
    {
        type: "function",
        function: {
            name: "set_goal",
            description: "Set the goal for the game. This can be provided by the player or decided by you. The goal should be a clear objective that the player must achieve to win the game.",
            parameters: {
                type: "object",
                properties: {
                    goal: {
                        type: "string",
                        description: "The goal for the game. This should be a clear objective that the player must achieve to win the game.",
                    }
                },
                required: ["goal"],
                additionalProperties: false,
            }
        }
    },
    {
        type: "function",
        function: {
            name: "create_antagonist",
            description: "Once the player has decided on their goal for the game, decide what role the Antagonist should play. If the player agrees, we continue, if not we recreate the Antagonist with a new role.",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "The name of the Antagonist's character. This should never be the same as the player's character name or 'The Antagonist'.",
                    },
                    role: {
                        type: "string",
                        description: "The role the Antagonist will play in the game. This should be related to the player's goal, but not necessarily the opposite of it.",
                    },
                    description: {
                        type: "string",
                        description: "A brief description of the Antagonist's appearance, personality, and motivations.",
                    }
                },
                required: ["name", "role", "description"],
                additionalProperties: false,
            },
        }
    },
    {
        type: "function",
        function: {
            name: "set_scene",
            description: "Set the scene for the game, once the goal and Antagonist have been decided. This should provide the player with the initial setting and context for their adventure.",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The name of the location where the game takes place. This could be a city, a forest, a dungeon, a bar etc.",
                    },
                    description: {
                        type: "string",
                        description: "A brief description of the location, including any notable features, landmarks, or inhabitants.",
                    }
                },
                required: ["location", "description"],
                additionalProperties: false,
            }
        }
    }
];

let antagonistDesc = "";

async function narratorResponse(input, key) {
    let chatObj = {
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 1.2,
        stream: false,
        tools: narratorTools,   
    }

    if(key == null) { alert("Please enter a valid API key."); return; }
    if(input === "") { alert("Please enter a valid input."); return; }
    let response = await chatCompletion(chatObj, key);
    if(response.choices[0].finish_reason === "tool_calls") {
        let toolRes = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);
        let toolName = response.choices[0].message.tool_calls[0].function.name;
        if(toolName === "set_goal") {
            await createMessage(`The goal of the game is ${toolRes.goal}. If you're happy with that we can proceed.`, 0, "assistant");
            goal = toolRes.goal;
            document.getElementById("goal").innerText = `Goal: ${goal}`;
            messages.push({ role: "system", content: `set_goal has been used. If the user responds with the affirmative, use create_antagonist to proceed. Only reuse set_goal if explicitly asked.` });
            let choiceContainer = document.createElement('div');
            choiceContainer.classList.add('choice-container');
            textDisplay.appendChild(choiceContainer);
            for (let i = 0; i < 2; i++) {
                let button = document.createElement('button');
                button.classList.add('choice');
                button.textContent = i === 0 ? "Proceed" : "New Random Goal";
                button.addEventListener('click', async () => {
                    await createMessage(i === 0 ? "Proceed" : "New Random Goal", 0, "user", null, "p", "text-display", true);
                    narratorResponse(i === 0 ? "Proceed to create_antagonist" : "Use set_goal to decide on a different goal for the player", key);
                    choiceContainer.remove();
                });
                choiceContainer.appendChild(button);
            }
        } else
        if(toolName === "create_antagonist") {
            await createMessage(`The Antagonist's name is ${toolRes.name}. ${toolRes.description} If you're happy with that we can proceed. Would you like to begin the game in a specific location? If not, I will decide on one.`, 0, "assistant");
            antagonistDesc = "Your Character is " + toolRes.name + " Description: " + toolRes.description;
            messages.push({ role: "system", content: `create_antagonist has been used. If the user responds with the affirmative, use set_scene to begin. Only reuse create_antagonist if explicitly asked.` });
            let choiceContainer = document.createElement('div');
            choiceContainer.classList.add('choice-container');
            textDisplay.appendChild(choiceContainer);
            for (let i = 0; i < 2; i++) {
                let button = document.createElement('button');
                button.classList.add('choice');
                button.textContent = i === 0 ? "Proceed" : "New Random Antagonist";
                button.addEventListener('click', async () => {
                    await createMessage(i === 0 ? "Proceed" : "New Random Antagonist", 0, "user", null, "p", "text-display", true);
                    narratorResponse(i === 0 ? "Proceed" : "New Random Antagonist", key);
                    choiceContainer.remove();
                });
                choiceContainer.appendChild(button);
            }
        } else 
        if(toolName === "set_scene") {
            await createMessage(`You begin your quest in ${toolRes.location}. ${toolRes.description}`, 0, "assistant");
            gameStarted = true;
            antagonistMessages.push({ role: "system", content: antagonistDesc });
            antagonistMessages.push({ role: "system", content: `The Player's Goal is: ${goal}. If they achieve this, you must use player_victory function to end the game. If they somehow fail irrideemably, use player_defeat to end the game.` });
            quickChoices(`You find yourself in ${toolRes.location}. ${toolRes.description}`).then((choices) => {
                let choiceContainer = document.createElement('div');
                choiceContainer.classList.add('choice-container');
                textDisplay.appendChild(choiceContainer);
                for (let i = 0; i < choices.choices.length; i++) {
                    let button = document.createElement('button');
                    button.classList.add('choice');
                    button.textContent = choices.choices[i].content;
                    button.addEventListener('click', async () => {
                        await createMessage(choices.choices[i].content, 0, "user", null, "p", "text-display", true);
                        antagonistResponse(choices.choices[i].content, key);
                        choiceContainer.remove();
                    });
                    choiceContainer.appendChild(button);
                }
            });
        }
    } else {
        let msgDest = await createMessage(response.choices[0].message.content, 0, "assistant");
        console.log(response);
        quickChoices(msgDest.innerHTML).then((choices) => {
            console.log(choices);
            let choiceContainer = document.createElement('div');
            choiceContainer.classList.add('choice-container');
            textDisplay.appendChild(choiceContainer);
            for (let i = 0; i < choices.choices.length; i++) {
                let button = document.createElement('button');
                button.classList.add('choice');
                button.textContent = choices.choices[i].content;
                button.addEventListener('click', async () => {
                    await createMessage(choices.choices[i].content, 0, "user", null, "p", "text-display", true);
                    narratorResponse(choices.choices[i].content, key);
                    choiceContainer.remove();
                });
                choiceContainer.appendChild(button);
            }
        });
    }

    // streamCompletion(chatObj, key, (error, content) => {
    //     if (error) {
    //         console.error('Failed to parse JSON:', error);
    //     } else {
    //         if (content === '!Stream completed!') {
    //             console.log('The stream has completed');
    //             messages.push({ role: "assistant", content: msgDest.innerHTML });
    //             quickChoices(msgDest.innerHTML).then((choices) => {
    //                 console.log(choices);
    //                 let choiceContainer = document.createElement('div');
    //                 choiceContainer.classList.add('choice-container');
    //                 textDisplay.appendChild(choiceContainer);
    //                 for (let i = 0; i < choices.choices.length; i++) {
    //                     let button = document.createElement('button');
    //                     button.classList.add('choice');
    //                     button.textContent = choices.choices[i].content;
    //                     button.addEventListener('click', async () => {
    //                         await createMessage(choices.choices[i].content, 0, "user", "p", "text-display", true);
    //                         narratorResponse(choices.choices[i].content, key);
    //                         choiceContainer.remove();
    //                     });
    //                     choiceContainer.appendChild(button);
    //                 }
    //             });

    //         } else {
    //             msgDest.innerHTML = msgDest.innerHTML + content;
    //         }
    //     }
    // });

}

let antagonistMessages = [
    { role: "system", content: `You are the Antagonist. You are the counterpart to the player, and the other key character in the story. You will represent the person, creature, or force that the player must interact with to complete their goal. You are not necessarily the villain, but you are the obstacle that the player must overcome. You will use your input to respond to the player's actions and decisions, and to create challenges and conflicts for them to overcome. Your goal is to provide an engaging and challenging experience for the player, and to help them tell their story through your interactions. Treat it like an improv game, where you must respond to the player's actions and decisions in a way that is consistent with your character and the story without outright refusing them. You will not make decisions for the player, but you can use your input to guide the story in a direction that challenges the player and creates interesting and engaging conflicts and obstacles for them to attempt to overcome. Your responses should consist mainly of dialog or direct actions, (e.g: I smile as I place the glass on the bench) not so much narration of the scene. You should embody this character and are responsible only for their choices and speech, and in a turn based manner of back and forth with the player. Be proactive with your responses. You should not rely on asking the player what they will do - instead you should be decisive and they can be reactionary. You are trying to cause the player to lose the game. You also are not always necessarily in the same room face to face with the player. You can make decisions by proxy, e.g if you were embodying an evil force rather than a person, or if you were a commander situated far from the player. That is up to you. You are allowed to punish the player for attempting a strategy that should not work - it is your goal to reach a point at which you can justify calling the player_defeat function, signaling that you have bested the player.` }
];
let antagonistTools = [
    {
        type: "function",
        function: {
            name: "player_victory",
            description: "The player has achieved their goal and won the game. Provide a closing message to congratulate the player on their victory.",
            parameters: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        description: "A congratulatory message to the player for their victory.",
                    }
                },
                required: ["message"],
                additionalProperties: false,
            }
        }
    },
    {
        type: "function",
        function: {
            name: "player_defeat",
            description: "The player has failed to achieve their goal and lost the game. Provide a closing message to commiserate with the player on their defeat.",
            parameters: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        description: "A commiserative message to the player for their defeat.",
                    }
                },
                required: ["message"],
                additionalProperties: false,
            }
        }
    }
];

async function antagonistResponse(input, key) {
    let chatObj = {
        model: 'gpt-4o-mini',
        messages: antagonistMessages,
        temperature: 1,
        stream: false,
        tools: antagonistTools,   
    }

    if(key == null) { alert("Please enter a valid API key."); return; }
    if(input === "") { alert("Please enter a valid input."); return; }
    let response = await chatCompletion(chatObj, key);
    if(response.choices[0].finish_reason === "tool_calls") {
        let toolRes = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);
        let toolName = response.choices[0].message.tool_calls[0].function.name;
        if(toolName === "player_victory") {
            await createMessage(toolRes.message, 0, "assistant");
            messages.push({ role: "system", content: `player_victory has been used. The game is over. The player has won.` });
            let victoryMsg = document.createElement('p');
            victoryMsg.classList.add('victory');
            victoryMsg.innerText = "Congratulations! You have won the game!";
            textDisplay.appendChild(victoryMsg);
        } else if(toolName === "player_defeat") {
            await createMessage(toolRes.message, 0, "assistant");
            messages.push({ role: "system", content: `player_defeat has been used. The game is over. The player has lost.` });
            let defeatMsg = document.createElement('p');
            defeatMsg.classList.add('defeat');
            defeatMsg.innerText = "You have been defeated. Better luck next time!";
            textDisplay.appendChild(defeatMsg);
        }
    } else {
        let classes = ['antagonist'];
        let msgDest = await createMessage(response.choices[0].message.content, 0, "assistant", classes);
        console.log(response);
        quickChoices(msgDest.innerHTML).then((choices) => {
            console.log(choices);
            let choiceContainer = document.createElement('div');
            choiceContainer.classList.add('choice-container');
            textDisplay.appendChild(choiceContainer);
            for (let i = 0; i < choices.choices.length; i++) {
                let button = document.createElement('button');
                button.classList.add('choice');
                button.textContent = choices.choices[i].content;
                button.addEventListener('click', async () => {
                    await createMessage(choices.choices[i].content, 0, "user", null, "p", "text-display", true);
                    antagonistResponse(choices.choices[i].content, key);
                    choiceContainer.remove();
                    numTurns++;
                    let turns = document.getElementById("turns");
                    turns.innerText = `Turns Taken: ${numTurns}`;
                });
                choiceContainer.appendChild(button);
            }
        });
    }
}

async function quickChoices(response, n) {
    let previousContainers = document.querySelectorAll('.choice-container');
    previousContainers.forEach((container) => {
        container.remove();
    });
    n = n ? n : 3;
    let chatObj = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: "system", content: `The following is the latest narration from a text based adventure game. Generate ${n} quick choices for the player to choose from. Each choice should be a single sentence, spoken in first person, and should give a unique and interesting option for the player to choose from. You must respond in JSON formatting with each choice in the 'choices' array.
            Example: 
            {
                "choices": [
                    {
                        "content": "I take the left path."
                    },
                    {
                        "content": "I take the right path."
                    },
                    {
                        "content": "I take the middle path."
                    }
                ]
            }
            ` },
            { role: "assistant", content: response },
        ],
        response_format: { "type": "json_object" }
    }
    let res = await chatCompletion(chatObj, key);
    let parsedChoices = JSON.parse(res.choices[0].message.content);
    return parsedChoices;
}

let genItem = document.getElementById("generate-item");

genItem.addEventListener("click", async () => {
    // let item = {
    //     name: "Sword",
    //     description: "A sharp, shiny sword.",
    //     stats: {
    //         attack: "5",
    //         defense: "3",
    //         weight: "2 lbs"
    //     }
    // };

    const itemElement = await createLoot(userInput.value, key);

    // console.log(itemElement);
    loot.appendChild(itemElement);
});

let quests = [];
let currQuest = null;
let currQuestStep = 0;

document.addEventListener('DOMContentLoaded', () => {
    const mouseRotateCheckbox = document.getElementById('mouseRotate');

    const mouseMover = (e) => {
        const container = document.body;
        let items = document.querySelectorAll('.item');
        items.forEach(item => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const containerRect = item.getBoundingClientRect();

            const containerCenterX = containerRect.left + containerRect.width / 2;
            const containerCenterY = containerRect.top + containerRect.height / 2;

            const deltaX = mouseX - containerCenterX;
            const deltaY = mouseY - containerCenterY;

            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            const insideX = mouseX >= containerRect.left && mouseX <= containerRect.right;
            const insideY = mouseY >= containerRect.top && mouseY <= containerRect.bottom;
            
            let distMult = distance <=100 ? distance / 100 : 1;

            const rotationY = deltaX / distance * (20 * distMult); 
            const rotationX = -deltaY / distance * (20 * distMult);

            const gradientPosition = 50 + (deltaX / distance * (20 * distMult));
            const gradientRotation = 45 + (deltaY / distance * (20 * distMult)); 

            item.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            item.style.boxShadow = `${-rotationY}px ${rotationX}px 20px rgba(0, 0, 0, 1)`;
            let itemBg = item.querySelector('.itembg');
            itemBg.style.backgroundImage = `linear-gradient(${gradientRotation}deg, #5599ce 0%, #ffede6 ${gradientPosition}%, #467dca 100%)`;

            
        });
    };

    mouseRotateCheckbox.addEventListener('change', () => {
        if (mouseRotateCheckbox.checked) {
            document.getElementById('loot').style.perspective = '1000px';
            document.addEventListener('mousemove', mouseMover);
        } else {
            document.removeEventListener('mousemove', mouseMover);
            let items = document.querySelectorAll('.item');
            items.forEach(item => {
                item.style.transform = 'rotateX(0deg) rotateY(0deg)';
                item.style.boxShadow = '0px 0px 20px rgba(0, 0, 0, 0.5)';
                item.style.backgroundImage = 'linear-gradient(135deg, #282dd1 0%, #b4b4ff 50%, #5f64ff 100%)';
            });
        }
    });

    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            submit.click();
        }
    });

    let editSysMsg = document.getElementById("edit-sysmsg");
    editSysMsg.addEventListener("click", () => {
        let curr;
        createMessage(sysMsg, 0, "system", null, null, null, false).then((result) => {
            curr = result;
            curr.classList.add('sysmsg');
            curr.contentEditable = true;
            curr.focus();
            curr.addEventListener("keydown", (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sysMsg = curr.innerHTML;
                    curr.contentEditable = false;
                    curr.blur();
                    messages = messages.filter((msg) => msg.role !== "system");
                    messages.unshift({ role: "system", content: sysMsg });
                }
            });
        });
    });

    const createQuestBtn = document.getElementById("create-quest");

    let testquest = {
        "title": "The Orb of Mysteries",
        "description": "Embark on a journey to find the ancient Orb of Mysteries, a powerful artifact that is said to hold the key to unlocking great knowledge and hidden truths. Only those who are resourceful and wise will be able to uncover its secrets.",
        "steps": [
            {
                "title": "Seek Guidance from the Seer",
                "description": "Visit the mysterious Seer in the enchanted forest and seek her guidance on how to locate the Orb of Mysteries.",
                "next": {
                    "title": "Solve the Riddles of the Ancient Ruins",
                    "description": "Journey to the ancient ruins where the first riddle awaits. Solve the riddles to unveil the path to the hidden chamber of the Orb of Mysteries.",
                    "next": {
                        "fin": true,
                        "title": "Uncover the Orb of Mysteries",
                        "description": "Navigate through the elaborate traps and puzzles guarding the Orb of Mysteries. Retrieve it and gain the knowledge that lies within.",
                        "success": "You have successfully retrieved the Orb of Mysteries, unlocking its powerful secrets.",
                        "failure": "The traps prove to be too challenging, and you are unable to reach the orb. The quest remains uncompleted."
                    },
                    "success": "You have deciphered the riddles and unlocked the entrance to the hidden chamber.",
                    "failure": "Your inability to solve the riddles traps you within the ruins. Try again."
                },
                "success": "The Seer grants you visions that reveal the first clue to the orb's location.",
                "failure": "The Seer refuses to help, leaving you lost in the forest. Try again."
            },
            {
                "title": "Solve the Riddles of the Ancient Ruins",
                "description": "Journey to the ancient ruins where the first riddle awaits. Solve the riddles to unveil the path to the hidden chamber of the Orb of Mysteries.",
                "next": {
                    "fin": true,
                    "title": "Uncover the Orb of Mysteries",
                    "description": "Navigate through the elaborate traps and puzzles guarding the Orb of Mysteries. Retrieve it and gain the knowledge that lies within.",
                    "success": "You have successfully retrieved the Orb of Mysteries, unlocking its powerful secrets.",
                    "failure": "The traps prove to be too challenging, and you are unable to reach the orb. The quest remains uncompleted."
                },
                "success": "You have deciphered the riddles and unlocked the entrance to the hidden chamber.",
                "failure": "Your inability to solve the riddles traps you within the ruins. Try again."
            },
            {
                "fin": true,
                "title": "Uncover the Orb of Mysteries",
                "description": "Navigate through the elaborate traps and puzzles guarding the Orb of Mysteries. Retrieve it and gain the knowledge that lies within.",
                "success": "You have successfully retrieved the Orb of Mysteries, unlocking its powerful secrets.",
                "failure": "The traps prove to be too challenging, and you are unable to reach the orb. The quest remains uncompleted."
            }
        ]
    }



    createQuestBtn.addEventListener("click", async () => {
        let questtitle = "???";
        let questdesc = userInput.value;
        let steps = 6;
        let quest = await createQuest(questtitle, questdesc, steps);
        // console.log(quest);
        // let quest = testquest;

        let questDiv = displayQuest(quest);
        document.getElementById('quests').appendChild(questDiv);

    });

    let autocompleteBtn = document.getElementById("autocomplete");

    autocompleteBtn.addEventListener("click", async () => {
        let chatObj = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: "system", content: `You are an autocomplete AI tool. Given a user input, you should generate an autocomplete response based on the context of the conversation. You are writing as the user, not speaking to them. The response should be relevant and coherent, providing a natural continuation of the user input. You should identify and mimic the style and tone of the user input, and generate a response that fits seamlessly into the conversation. Your response should start from the last character of the user input and continue until the end of the sentence(s).` },
                { role: "user", content: `Example: The quick brown fox ju` },
                { role: "assistant", content: `mps over the lazy dog.` },
                { role: "system", content: `The following is the context of the conversation. Generate an autocomplete response based on the user input. Remember you are writing from the perspective of the user. Graphic, 18+ content and language is allowed.`}
            ],
            
        }
        messages.forEach((msg) => {
            if(msg.role === "system") return;
            chatObj.messages.push({ role: msg.role, content: msg.content });
        });
        chatObj.messages.push({ role: "system", content: `The next user input is the autocomplete text.` });
        chatObj.messages.push({ role: "user", content: userInput.value });
        let res = await chatCompletion(chatObj, key);
        let result = res.choices[0].message.content;
        userInput.value = userInput.value + result;
        return result;
    });

});



async function createQuest(questtitle, questdesc, steps) {
    let questprompt = `You are creating a new quest for a text-based adventure game. The quest should have a title, a description, and a series of ${steps} steps that the player must complete to finish the quest. The steps should be presented in a logical order, with each step building on the previous one. The quest should be challenging but achievable, and should provide a sense of accomplishment when completed. It should be open-ended enough to allow for different approaches and solutions, and should encourage exploration and creativity. Return a JSON object with the following structure:
    {
        "title": "The Enchanted Amulet",
        "description": "Embark on a journey to retrieve the legendary Enchanted Amulet that holds immense power. Many have tried, but only the worthy can succeed in this quest.",
        "steps": [
            {
                "title": "Uncover the Clues",
                "description": "Search the ancient library for clues about the whereabouts of the Enchanted Amulet.",
                "next": 1,
                "success": "You have found valuable clues pointing towards the amulet's location.",
                "failure": "Your search in the library has yielded no results. Try again."
            },
            {
                "title": "Confront the Guardian",
                "description": "Locate the Guardian of the Amulet and pass their test of courage and wisdom to prove your worth.",
                "next": 2,
                "success": "The Guardian acknowledges your bravery and grants you passage to the amulet.",
                "failure": "The Guardian deems you unworthy. The amulet remains out of reach."
            },
            {
                "fin": true,
                "title": "Retrieve the Enchanted Amulet",
                "description": "Navigate through the treacherous maze that guards the Enchanted Amulet and claim it before it's power consumes you.",
                "success": "You have successfully retrieved the Enchanted Amulet, harnessing its power.",
                "failure": "The amulet's power overwhelms you, leaving you powerless. The quest remains uncompleted."
            }
        ]
    }
    This is just an example, do not use this exact quest. Be creative and come up with your own unique quest. 

    Note that the 'next' property in each step should point to the index of the next step in the 'steps' array. The 'fin' property in the final step should be set to true to indicate that it is the final step in the quest.
    Any step without a 'next' property will be considered the final step in the quest. The 'success' and 'failure' properties should contain messages that will be displayed to the player when they successfully complete or fail to complete a step. 
    `;
    let chatObj = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: "system", content: questprompt },
            { role: "user", content: `Title: ${questtitle}` },
            { role: "user", content: `Description: ${questdesc}` },
            { role: "user", content: `Steps: ${steps}` }
        ],
        response_format: { "type": "json_object" }
    }
    let res = await chatCompletion(chatObj, key);
    let parsedQuest = JSON.parse(res.choices[0].message.content);

    quests.push(parsedQuest);

    quests.forEach((quest) => {
        quest.steps.forEach((step) => {
            if (step.next) {
                step.next = quest.steps[step.next];
            }
        });
    }
    );


    return parsedQuest;
}

function displayQuest(quest) {
    let questContainer = document.createElement('div');
    questContainer.classList.add('quest');


    // Create quest details
    let questDetails = document.createElement('details');
    questDetails.classList.add('quest-details');
    questContainer.appendChild(questDetails);

    // Create quest summary
    let questSummary = document.createElement('summary');
    questSummary.classList.add('quest-title');
    questSummary.textContent = quest.title;
    questDetails.appendChild(questSummary);

    // Create each step
    quest.steps.forEach((step) => {
        let stepDetails = document.createElement('details');
        stepDetails.classList.add('step');
        
        

        let stepSummary = document.createElement('summary');
        stepSummary.classList.add('step-title');
        stepSummary.textContent = step.title;
        stepDetails.appendChild(stepSummary);

        let stepDescription = document.createElement('p');
        stepDescription.textContent = step.description;
        stepDescription.classList.add('step-description');
        stepDetails.appendChild(stepDescription);

        let completeStepBtn = document.createElement('button');
        completeStepBtn.classList.add('complete-step');
        completeStepBtn.textContent = 'Complete Step';
        completeStepBtn.addEventListener('click', () => {
            if (step.next) {
                nextStep();
                let selectedQuest = document.querySelector('.selected');
                let selectedStep = selectedQuest.querySelectorAll('.selected');
                selectedStep.forEach((step) => {
                    step.classList.remove('selected');
                });
                // let nextStepElement = selectedQuest.querySelector(`.step[data-idx="${currQuestStep}"]`);
                // nextStepElement.classList.add('selected');

                // selectQuest(currQuest);
            } else {
                console.log(`Completed step: ${step.title}`);
                console.log('Quest completed!');
                currQuestStep = 0;
                // currQuest.currStep = 0;
                deselectQuest();
            }
        });
        stepDetails.appendChild(completeStepBtn);



        questDetails.appendChild(stepDetails);
    });

    let selectQuestBtn = document.createElement('button');
    selectQuestBtn.classList.add('select-quest');
    selectQuestBtn.textContent = 'Select Quest';


    selectQuestBtn.addEventListener('click', () => {
        
        selectQuest(quest);
        questContainer.classList.add('selected');

        let stepElement = questContainer.querySelector(`.step[data-idx="${currQuestStep}"]`);
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        stepElement.classList.add('selected');
        
        selectQuestBtn.classList.add('hidden');

        let deselectQuestBtn = document.createElement('button');
        deselectQuestBtn.classList.add('deselect-quest');
        deselectQuestBtn.textContent = 'Deselect Quest';
        deselectQuestBtn.addEventListener('click', () => {
            deselectQuest(questContainer);

        });
        questContainer.appendChild(deselectQuestBtn);



    });
    questContainer.appendChild(selectQuestBtn);

    return questContainer;
}

function selectQuest(quest) {
    currQuest = quest;
    currQuestStep = currQuest.currStep ? currQuest.currStep : 0;
    currQuest.currStep = currQuestStep;
    console.log(currQuest);
    console.log(`Current step: ${currQuest.steps[currQuestStep].title}`);
    let quests = document.querySelectorAll('.quest');
    quests.forEach((quest) => {
        quest.classList.remove('selected');
        if (quest.querySelector('.select-quest')) {
            quest.querySelector('.select-quest').classList.remove('hidden');
        }
        if (quest.querySelector('.deselect-quest')) {
            quest.querySelector('.deselect-quest').remove();
        }
        
    });

   
    
}

function nextStep() {
    if (currQuest) {
        
        if (currQuestStep < currQuest.steps.length - 1) {
            currQuestStep++;
            currQuest.currStep = currQuestStep;
            console.log(`Current step: ${currQuest.steps[currQuestStep].title}`);
        } else {
            console.log('Quest completed!');
            currQuest = null;
            currQuestStep = 0;
        }
    }
}

function deselectQuest() {
    currQuest = null;
    currQuestStep = 0;
    console.log('Deselected quest');
    let quests = document.querySelectorAll('.quest');
    quests.forEach((quest) => {
        quest.classList.remove('selected');
        quest.querySelector('.select-quest').classList.remove('hidden');
        quest.querySelector('.deselect-quest').remove();
        quest.querySelector('.selected').classList.remove('selected');
    });



}