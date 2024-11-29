const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require("qrcode");
const qrTerminal = require("qrcode-terminal");

const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
    type: "remote",
        remotePath:
        "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
});

let currentQRCode;
let isScanned = false;

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', async (qr) => {
    try {
        currentQRCode = await qrcode.toDataURL(qr);
        isScanned = false;
        qrTerminal.generate(qr, { small: true });
    } catch (error) {
        console.error("Error generating QR code:", error);
    }
});

client.on('authenticated', () => {
    isScanned = true;
});

const initializeClient = () => {
    client.initialize();
}

initializeClient();

const qrCodeString = async (req, res) => {
    if (isScanned) {
        res.json({
            isScanned: true,
            status: false,
            message: "QR Code has already been scanned"
        });
    } else if (currentQRCode) {
        res.json({
            isScanned: false,
            status: true,
            qrcode: currentQRCode
        });
    } else {
        res.json({
            isScanned: false,
            status: false,
            message: "Waiting Server Is Online"
        });
    }
}

const sendMessageText = async (req, res) => {
    let phone = req.body.phone;
    const message = req.body.message;

    try {
        if (phone.startsWith('0')) {
            phone = "62" + phone.slice(1) + "@c.us";
        } else if(phone.startsWith('62')) {
            phone = phone + "@c.us";
        } else {
            phone = "62" + phone + "@c.us";
        }

        const isRegistered = await client.isRegisteredUser(phone);

        if (isRegistered) {
            client.sendMessage(phone, message);
            res.json({
                "status": true,
                "message": "Successfully Sent The Message",
                "data": {
                    "phone": phone,
                    "message": message,
                }
            });
        } else {
            res.json({
                "status": false,
                "message": "Phone Number Is Not Listed"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": "Server Error",
            "error": error
        });
    }
}

const sendMessageMedia = async (req, res) => {
    let phone = req.body.phone;
    const file = req.body.file;
    const message = req.body.message;

    try {
        if (phone.startsWith('0')) {
            phone = "62" + phone.slice(1) + "@c.us";
        } else if(phone.startsWith('62')) {
            phone = phone + "@c.us";
        } else {
            phone = "62" + phone + "@c.us";
        }

        const isRegistered = await client.isRegisteredUser(phone);

        if (isRegistered) {

            if (file !== undefined && file !== null && file !== "") {
                let mediaFile = await MessageMedia.fromUrl(file, { unsafeMime: true });

                client.sendMessage(phone, mediaFile, { caption: message });
                
                res.json({
                    "status": true,
                    "message": "Successfully Sent The Message",
                    "data": {
                        "phone": phone,
                        "message": message,
                        "file": mediaFile.filename
                    }
                });
            } else {
                client.sendMessage(phone, message);
                res.json({
                    "status": true,
                    "message": "Successfully Sent The Message",
                    "data": {
                        "phone": phone,
                        "message": message,
                    }
                });
            }
        } else {
            res.json({
                "status": false,
                "message": "Phone Number Is Not Listed"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": "Server Error",
            "error": error
        });
    }
}

const logout = async (req, res) => {
    try {
        await client.destroy();
        console.log('Client disconnected');

        // Tentukan path ke folder autentikasi. Secara default, LocalAuth menyimpan di .wwebjs_auth
        const authFolder = path.resolve(__dirname, '.wwebjs_auth');

        if (fs.existsSync(authFolder)) {
            fs.rmSync(authFolder, { recursive: true, force: true });
            console.log('Authentication data deleted');
        }

        initializeClient();

        res.json({
            "status": true,
            "message": "Successfully logged out"
        });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({
            "status": false,
            "message": "Failed to log out",
            "error": error.toString()
        });
    }
}


module.exports = {
    sendMessageText,
    sendMessageMedia,
    qrCodeString,
    logout
};