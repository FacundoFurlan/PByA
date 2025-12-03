import { signOut } from "firebase/auth";
import { auth } from "./firebase/config";

export function highlightText(scene, selector) {
    scene.coopText.setColor("#fff");
    scene.versusText.setColor("#fff");
    scene.languageText.setColor("#fff");
    scene.scoreboardText.setColor("#fff");
    let text = null;
    if (selector !== undefined) scene.selector = selector;
    if (scene.selector === 3) text = scene.coopText;
    if (scene.selector === 2) text = scene.versusText;
    if (scene.selector === 1) text = scene.scoreboardText;
    if (scene.selector === 0) text = scene.languageText;

    text.setColor("#2ed12eff");
}

export async function logout(scene) {
    try {
        await signOut(auth);
        console.log("Sesión cerrada");

        scene.scene.start("MainMenu");
    } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
    }
}

export function profileIcon(scene) {
    const user = auth.currentUser;
    const { width, height } = scene.scale;

    // Función para agregar interaccion al icono
    const makeInteractive = (img) => {
        img.setInteractive({ useHandCursor: true });
        img.on("pointerdown", () => togglePopup(scene));
    };

    //  Si ya había una imagen antes → destruirla
    if (scene.img) {
        scene.img.destroy();
        scene.img = null;
    }

    //  Si ya existía la textura → eliminarla del caché
    if (scene.textures.exists("userProfile")) {
        scene.textures.remove("userProfile");
    }

    if (user && user.photoURL) {
        // ✅ Cache busting para forzar descarga nueva
        const freshUrl = `${user.photoURL}?t=${Date.now()}`;

        scene.load.once("complete", () => {
            const img = scene.add.image(width / 1.05, height / 12, "userProfile");

            img.setDisplaySize(30, 30); // ajustar tamaño

            // Crear círculo del tamaño de la imagen
            const circle = scene.make.graphics({});
            circle.fillStyle(0xffffff);
            circle.beginPath();
            circle.arc(img.x, img.y, img.displayWidth / 2, 0, Math.PI * 2);
            circle.closePath();
            circle.fill();

            // Crear máscara
            const mask = circle.createGeometryMask();
            img.setMask(mask);
            scene.img = img
            makeInteractive(img);
        });
        scene.load.image("userProfile", freshUrl);
        scene.load.start();
    } else {
        const img = scene.add.image(width / 1.05, height / 12, "profileIcon").setScale(1);
        scene.img = img;
        makeInteractive(img);
    }
}

export function createPopup(scene) {

    const user = auth.currentUser;

    // --- POPUP CONTAINER ---
    scene.popup = scene.add.container(0, 0).setVisible(false);

    // Fondo del popup
    const bg = scene.add.rectangle(0, 0, 140, 120, 0x000000, 0.8)
        .setOrigin(0);

    // Botones
    const loginText = scene.add.text(10, 10, "Login", { fontSize: "16px", color: "#fff" })
        .setInteractive({ useHandCursor: true });

    const registerText = scene.add.text(10, 45, "Register", { fontSize: "16px", color: "#fff" })
        .setInteractive({ useHandCursor: true });

    const logoutText = scene.add.text(10, 80, "Logout", { fontSize: "16px", color: "#fff" })
        .setInteractive({ useHandCursor: true });

    // Eventos de botones
    loginText.on("pointerdown", () => handleLogin(scene));
    registerText.on("pointerdown", () => handleRegister(scene));
    logoutText.on("pointerdown", () => handleLogout(scene));

    // --- MOSTRAR ÚNICAMENTE LO QUE CORRESPONDE ---
    if (user) {
        // 🔹 Usuario logeado → solo Logout
        loginText.setVisible(false);
        registerText.setVisible(false);

        logoutText.y = 10; // lo pongo arriba
        logoutText.setVisible(true);

        // fondo se ajusta a altura de 2 items
        bg.height = 40;

        scene.popup.add([bg, logoutText]);

    } else {
        // 🔹 Usuario NO logeado → Login + Register
        logoutText.setVisible(false);

        // fondo se ajusta a altura de 2 items
        bg.height = 80;

        scene.popup.add([bg, loginText, registerText]);
    }

}

export function togglePopup(scene) {
    const visible = scene.popup.visible;
    scene.popup.setVisible(!visible);

    if (!visible) {
        scene.popup.x = scene.img.x - 120; // mejor posición relativa al ícono
        scene.popup.y = scene.img.y + 30;
    }
}

export function handleLogin(scene) {
    scene.sound.stopAll();
    scene.scene.start("Login");
}
export function handleRegister(scene) {
    scene.sound.stopAll();
    scene.scene.start("Register");
}
export function handleLogout(scene) {
    logout(scene)
    scene.yesUserText = false;
}
