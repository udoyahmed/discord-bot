export { commands };

const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'valorant',
        description: 'Get valorant information',
    },
    {
        name: 'valorantmatch',
        description: 'Get valorant match information',
        options: [
            {
                name: "name",
                type: 3,
                description: "The name of the player",
                required: true
            },
            {
                name: "tag",
                type: 3,
                description: "The tag of the player",
                required: true
            }
        ]
    },
    {
        name: "valorantid",
        description: "Get valorant profile information",
        options: [
            {
                name: "name",
                type: 3,
                description: "The name of the player",
                required: true
            },
            {
                name: "tag",
                type: 3,
                description: "The tag of the player",
                required: true
            }
        ]
    },
    {
        name: "botjoin",
        description: "Join the voice channel"
    },
    {
        name: "botleave",
        description: "Leave the voice channel"
    },
];