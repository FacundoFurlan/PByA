// LoginScene.js
import Phaser from "phaser";
import { auth } from "../../utils/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { GithubAuthProvider } from "firebase/auth";
import { getPhrase } from "../../utils/Translations";
import keys from "../../utils/enums/keys";

export class LoginScene extends Phaser.Scene {
    constructor() {
        super("Login");
        const { noUser, yesUser, register, continueWith, errorWith, missingData, login, password } = keys.sceneFirebase;
        this.continueWith = continueWith;
        this.errorWith = errorWith;
        this.missingData = missingData;
        this.login = login;
        this.password = password;
    }

    preload() { }

    create() {
        const { width, height } = this.scale;

        // Inputs HTML
        this.createInputs();

        this.input.keyboard.manager.preventDefault = false;

        this.enableKeyboardControls();

        this.add.text(width / 2, 50, getPhrase(this.login), {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Error text
        this.errorText = this.add.text(width / 2, 300, "", {
            fontFamily: "Arial",
            fontSize: "20px",
            color: "#ff6961"
        }).setOrigin(0.5);

        // Botón Google
        this.googleBtn = this.add.text(width / 4, 250, getPhrase(this.continueWith) + " Google", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#4285F4",
            padding: { x: 10, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.loginWithGoogle());

        // Botón GitHub
        this.githubBtn = this.add.text(width * (3 / 4), 250, getPhrase(this.continueWith) + " Github", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#24292e", // color GitHub
            padding: { x: 10, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.loginWithGitHub());
    }

    async loginWithGitHub() {
        const provider = new GithubAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);

            console.log("Login GitHub ok:", result.user.email);

            this.cleanInputs();
            this.input.keyboard.manager.preventDefault = true;
            this.scene.start("MainMenu");

        } catch (error) {
            console.error("GitHub login error:", error.message);
            this.errorText.setText(getPhrase(this.errorWith) + ": Github " + error.message);
        }
    }


    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);

            console.log("Login Google ok:", result.user.email);

            this.cleanInputs();
            this.input.keyboard.manager.preventDefault = true;
            this.scene.start("MainMenu");

        } catch (error) {
            console.error("Google login error:", error.message);
            this.errorText.setText(getPhrase(this.errorWith) + ": Google " + error.message);
        }
    }

    createInputs() {
        this.formWrapper = document.createElement("div");
        
        Object.assign(this.formWrapper.style, {
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
        });
        document.body.appendChild(this.formWrapper);

        // email
        this.emailInput = document.createElement("input");
        this.emailInput.type = "text";
        this.emailInput.placeholder = "Email";
        Object.assign(this.emailInput.style, {
            width: "260px",
            padding: "10px",
            fontSize: "18px"
        });

        // password
        this.passInput = document.createElement("input");
        this.passInput.type = "password";
        this.passInput.placeholder = getPhrase(this.password);
        Object.assign(this.passInput.style, {
            width: "260px",
            padding: "10px",
            fontSize: "18px"
        });

        this.formWrapper.appendChild(this.emailInput);
        this.formWrapper.appendChild(this.passInput);

        this.emailInput.focus();

        this.applyInputKeyHandlers();
    }

    applyInputKeyHandlers() {
        const email = this.emailInput;
        const pass = this.passInput;

        email.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                pass.focus();
            }
            if (e.key === "Enter") {
                e.preventDefault();
                this.submitForm();
            }
        });

        pass.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                email.focus();
            }
            if (e.key === "Enter") {
                e.preventDefault();
                this.submitForm();
            }
        });
    }

    enableKeyboardControls() {
        document.addEventListener(
            "keydown",
            (e) => {
                const active = document.activeElement;
                const isInputFocused =
                    active && (
                        active.tagName === "INPUT" ||
                        active.tagName === "TEXTAREA" ||
                        active.isContentEditable
                    );

                if (isInputFocused && e.key !== "Escape") return;

                if (e.key === "Escape") {
                    e.stopPropagation();
                    this.returnToMenu();
                }
            },
            true
        );
    }

    async submitForm() {
        const email = this.emailInput.value.trim();
        const password = this.passInput.value.trim();

        this.errorText.setText("");

        if (!email || !password) {
            this.errorText.setText(getPhrase(this.missingData));
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);

            console.log("Login OK");
            this.cleanInputs();
            this.input.keyboard.manager.preventDefault = true;
            this.scene.start("MainMenu");

        } catch (error) {
            console.error("Error login:", error.message);
            this.errorText.setText(error.message);
        }
    }

    returnToMenu() {
        this.cleanInputs();
        this.input.keyboard.manager.preventDefault = true;
        this.scene.start("MainMenu");
    }

    cleanInputs() {
        if (this.formWrapper) {
            document.body.removeChild(this.formWrapper);
            this.formWrapper = null;
        }
    }
}
