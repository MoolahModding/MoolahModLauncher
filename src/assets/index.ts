import "./style.css"

const launcherConfig = {
  launcherVersion: "1.0", // TODO: should come from package.json
  gameLaunchPossible: true, // TODO: unimplemented
  keepLauncherOpen: true, // TODO: unimplemented
  gameDirectory: "C:/Program Files (x86)/Steam/steamapps/common/PAYDAY 3", // TODO: should come from config
}

const mods: Array<HTMLLIElement | null> = []
let currentSelectedMod: string

const config = window.moolah.config

window.onload = (e) => {
  loadSettings()
}

const modList = document.getElementById("modList") as HTMLUListElement
const modListContainer = document.getElementById("modlistContainer")!
const launcherVersion = document.getElementById("version")!

const settings = {
  launchBtn: document.getElementById("launchGame")!,
  gameVersion: document.getElementById("gameVersion")!,
  btn: document.querySelector('.settingsButton[icon="settings"]')!,
  panel: document.getElementById("settingsPanel")!,
  gamedir: document.getElementById("setGameDir") as HTMLInputElement,
  keepOpen: document.getElementById("setKeepOpen") as HTMLInputElement,
}
const details = {
  icon: document.getElementById("detailsModIcon") as HTMLImageElement,
  name: document.getElementById("detailsModName")!,
  version: document.getElementById("detailsModVersion")!,
  author: document.getElementById("detailsModAuthor")!,
  website: document.getElementById("detailsModWebsite") as HTMLAnchorElement,
  issues: document.getElementById("detailsModIssues") as HTMLAnchorElement,
  desc: document.getElementById("detailsModDesc")!,
}
const popup = {
  popup: document.querySelector(".popup")!,
  header: document.getElementById("popupHeader")!,
  text: document.getElementById("popupText")!,
  btn: {
    yes: document.querySelector('.popupButton[data-btn="yes"]')!,
    no: document.querySelector('.popupButton[data-btn="no"]')!,
    ok: document.querySelector('.popupButton[data-btn="ok"]')!,
    close: document.querySelector('.popupButton[data-btn="close"]')!,
  },
}

// Call this to after changing and saving the config to update the UI with the new settings.
function updateSettings() {
  launcherVersion.innerText = "v" + launcherConfig.launcherVersion
  switch (launcherConfig.gameLaunchPossible) {
    case true:
      settings.launchBtn.removeAttribute("disabled")
      break
    case false:
      settings.launchBtn.setAttribute("disabled", "")
      break
  }

  settings.gamedir.value = launcherConfig.gameDirectory

  if (launcherConfig.gameDirectory.toLowerCase().includes("steam")) {
    console.log("probably steam")
    settings.gameVersion.setAttribute("gameversion", "steam")
  } else if (launcherConfig.gameDirectory.toLowerCase().includes("epic")) {
    console.log("probably egs")
    settings.gameVersion.setAttribute("gameversion", "egs")
  } else {
    console.log("idk man")
    settings.gameVersion.setAttribute("gameversion", "?")
  }

  switch (launcherConfig.keepLauncherOpen) {
    case true:
      settings.keepOpen.checked = true
      break
    case false:
      settings.keepOpen.checked = false
      break
  }
}

updateSettings()

function saveConfig() {
  const newGameDirectory = settings.gamedir.value
  const newKeepOpen = settings.keepOpen.checked
  // CALL FUNCTION TO UPDATE USER CONFIG

  console.log(newKeepOpen)
  console.log(newGameDirectory)
  toggleSettingsPanel()
  updateSettings()
}

function loadSettings() {
  const gameDir = document.getElementById("setGameDir")! as HTMLInputElement
  const keepOpen = document.getElementById("setKeepOpen")! as HTMLInputElement
  gameDir.value = config.getConfigValue("gameDirectory")
  keepOpen.checked = config.getConfigValue("keepLauncherOpen")
}

function saveSettings() {
  // Should always load the config before reading from it and save after writing, because
  // nodejs and normal javascript have different instances of the config
  const keepOpen = document.getElementById("setKeepOpen") as HTMLInputElement
  void config.setConfigValue("gameDirectory", "test") //document.getElementById("setGameDir").value);
  void config.setConfigValue("keepLauncherOpen", keepOpen.checked)
}

function toggleSettingsPanel() {
  settings.panel.classList.toggle("hide")
  settings.btn.classList.toggle("active")
}

// example: createModItem('amog', 'Amogus Lootbags', 'Replaces Lootbags with amogus', '1.0.2', 'Lenny, Capcake', 'https://www.amongus.com', 'https://www.github.com/amogus', 'path to icon', true[if mod is enabled or not])
function createModItem(
  id: string,
  name: string,
  desc: string,
  version: string,
  author: string,
  website: string,
  issues: string,
  icon: string,
  active: boolean
) {
  const modItem = document.createElement("li")
  const modInfo = document.createElement("span")
  const delBtn = document.createElement("button")
  const togBtn = document.createElement("button")

  modItem.classList.add("modItem")
  modItem.setAttribute("mod-id", id)
  modItem.setAttribute("mod-name", name)
  modItem.setAttribute("mod-version", version)
  modItem.setAttribute("mod-desc", desc)
  modItem.setAttribute("mod-author", author)
  modItem.setAttribute("mod-website", website)
  modItem.setAttribute("mod-issues", issues)
  modItem.setAttribute("mod-icon", icon)
  modList.appendChild(modItem)

  modInfo.innerText = name
  modInfo.setAttribute("onclick", "openMod(this.parentNode)")
  modInfo.setAttribute("modversion", version)
  modInfo.setAttribute("author", author)
  modItem.appendChild(modInfo)

  delBtn.classList.add("modBtn")
  delBtn.setAttribute("icon", "delete")
  delBtn.setAttribute("onclick", "confirmDeleteMod(this)")
  modItem.appendChild(delBtn)

  togBtn.classList.add("modBtn")
  togBtn.setAttribute("icon", "toggle")
  togBtn.setAttribute("onclick", "toggleMod(this)")
  modItem.appendChild(togBtn)

  console.log(id + ' added to list as: "' + name + '"')

  switch (active) {
    case true:
      modItem.setAttribute("installed", "true")
      togBtn.setAttribute("ticked", "")
      break
    case false:
      modItem.setAttribute("installed", "false")
      togBtn.removeAttribute("ticked")
      break
  }

  modItem.setAttribute("mod-index", mods.length.toString())
  mods.push(modItem)

  console.log(mods)
}

function openMod(selectedMod: HTMLLIElement) {
  const mod = {
    id: selectedMod.getAttribute("mod-id")!,
    icon: selectedMod.getAttribute("mod-icon")!,
    name: selectedMod.getAttribute("mod-name")!,
    desc: selectedMod.getAttribute("mod-desc")!,
    version: selectedMod.getAttribute("mod-version")!,
    author: selectedMod.getAttribute("mod-author")!,
    website: selectedMod.getAttribute("mod-website")!,
    issues: selectedMod.getAttribute("mod-issues")!,
  }

  currentSelectedMod = mod.id

  details.name.innerText = mod.name
  details.version.setAttribute("modversion", mod.version)
  details.author.innerText = mod.author
  details.author.classList.remove("hide")
  details.desc.innerText = mod.desc

  switch (mod.website) {
    case null:
    case undefined:
      console.log("no website link found")
      details.website.removeAttribute("href")
      details.website.setAttribute("disabled", "")
      break
    case "none":
      console.log("no website set")
      details.website.removeAttribute("href")
      details.website.setAttribute("disabled", "")
      break
    default:
      console.log(mod.website)
      details.website.href = mod.website
      details.website.removeAttribute("disabled")
      break
  }

  switch (mod.issues) {
    case null:
    case undefined:
      console.log("no issues link found")
      details.issues.removeAttribute("href")
      details.issues.setAttribute("disabled", "")
      break
    case "none":
      console.log("no issues link set")
      details.issues.removeAttribute("href")
      details.issues.setAttribute("disabled", "")
      break
    default:
      console.log(mod.issues)
      details.issues.href = mod.issues
      details.issues.removeAttribute("disabled")
      break
  }

  details.icon.src = mod.icon
  details.icon.addEventListener("error", (e) => {
    console.log("no icon found!")
    details.icon.src = "img/missing_image.svg"
  })

  window.scrollTo({ top: 0, behavior: "smooth" })
  console.log(selectedMod)
}

modListContainer.addEventListener("dragover", (event) => {
  event.preventDefault()
  event.stopPropagation()
})

modListContainer.addEventListener("drop", (event) => {
  event.preventDefault()
  event.stopPropagation()

  const paths: string[] = []
  for (const f of event.dataTransfer!.files) paths.push(f.path)
  window.moolah.events.installMods(paths)
})

function confirmDeleteMod(modItem: HTMLLIElement) {
  console.log(modItem)
  const parentNode = modItem.parentNode as HTMLUListElement
  const text =
    "Are you sure you want to uninstall " +
    parentNode.getAttribute("mod-name") +
    "?"
  confirmDelete("Uninstall this mod?", text, modItem)
  console.log("yeet ", parentNode.getAttribute("mod-name"))
}
function deleteMod(modItem: HTMLLIElement) {
  const parentNode = modItem.parentNode as HTMLUListElement
  parentNode.remove()
  mods[parentNode.getAttribute("mod-index") as unknown as number] = null
  console.log(mods)
  if (currentSelectedMod === parentNode.getAttribute("mod-id")) {
    details.name.innerText = "No mod selected..."
    details.icon.src = "img/missing_image.svg"
    details.version.setAttribute("modversion", "")
    details.author.innerText = ""
    details.desc.innerText = ""
    details.author.classList.add("hide")
    details.issues.removeAttribute("href")
    details.issues.setAttribute("disabled", "")
    details.website.removeAttribute("href")
    details.website.setAttribute("disabled", "")
  }

  console.log(parentNode.getAttribute("mod-name") + " deleted")
  // CALL FUNCTION TO DELETE/UNINSTALL MOD
}

function openPopup(header: string, text: string, buttons: string) {
  popup.header.innerText = header
  popup.text.innerText = text
  switch (buttons) {
    case "ok":
      popup.btn.yes.setAttribute("hidden", "")
      popup.btn.no.setAttribute("hidden", "")
      popup.btn.close.setAttribute("hidden", "")
      break
    case "close":
      popup.btn.yes.setAttribute("hidden", "")
      popup.btn.no.setAttribute("hidden", "")
      popup.btn.ok.setAttribute("hidden", "")
      break
    case "none":
      popup.btn.yes.setAttribute("hidden", "")
      popup.btn.no.setAttribute("hidden", "")
      popup.btn.ok.setAttribute("hidden", "")
      popup.btn.close.setAttribute("hidden", "")
      break
  }

  popup.popup.classList.remove("hide")
}

function closePopup() {
  popup.popup.classList.add("hide")
  popup.header.innerText = "/ PLACEHOLDER HEADER /"
  popup.text.innerText = "/ PLACEHOLDER TEXT /"
  popup.btn.yes.removeAttribute("hidden")
  popup.btn.no.removeAttribute("hidden")
  popup.btn.ok.removeAttribute("hidden")
  popup.btn.close.removeAttribute("hidden")
}

function confirmDelete(header: string, text: string, item: HTMLLIElement) {
  popup.header.innerText = header
  popup.text.innerText = text
  popup.btn.ok.setAttribute("hidden", "")
  popup.btn.close.setAttribute("hidden", "")
  popup.popup.classList.remove("hide")
  popup.btn.yes.addEventListener("click", (e) => {
    closePopup()
    deleteMod(item)
  })
}

function toggleMod(modItem: HTMLLIElement) {
  console.log(modItem)
  const parentNode = modItem.parentNode as HTMLUListElement
  const modName = parentNode.getAttribute("mod-name")!
  switch (parentNode.getAttribute("installed")) {
    case "true":
      parentNode.setAttribute("installed", "false")
      modItem.removeAttribute("ticked")
      openPopup("Mod Disabled", modName + " has been disabled.", "ok")
      // CALL FUNCTION TO DISABLE MOD
      break
    case "false":
      parentNode.setAttribute("installed", "true")
      modItem.setAttribute("ticked", "")
      openPopup("Mod enabled", modName + " has been enabled.", "ok")
      // CALL FUNCTION TO ENABLE MOD
      break
  }
}

function launchGame() {
  if (launcherConfig.gameLaunchPossible === true) {
    // CALL FUNCTION TO LAUNCH GAME
    openPopup(
      "Launching game...",
      "Your game is now launching and this window will close.",
      "none"
    )
    window.moolah.events.launchGame()
  }
}

function toggleInfo() {
  const infotext =
    'Placeholder text.\n\n"oh nyo"\n- kitteh\n\nidk put like credits here or something'
  openPopup("", infotext, "close")
}

// function checkUpdates() {
//   // CALL FUNCTION TO CHECK FOR UPDATES
//   // IF NONE ARE AVAILABLE CALL FUNCTION BELOW
//   openPopup("No updates found", "Your mods are up-to-date!", "ok")
// }

// function getInstalledModsAndPopulateList() {
//   const installedMods = window.installedpopulator.ILP_getInstalledMods()

//   for (const installedModIndex in installedMods) {
//     const mod = installedMods[installedModIndex]
//     try {
//       createModItem(
//         mod["id"],
//         mod["name"],
//         mod["description"],
//         mod["version"],
//         mod["authors"].join(", "),
//         mod["contact"]["homepage"],
//         null,
//         mod["finalIconPath"],
//         true
//       )
//     } catch (e) {
//       console.warn(
//         "Mod: " + mod["id"] + " had an issue while installing: " + e.toString()
//       )
//     }
//   }
// }
// getInstalledModsAndPopulateList()

// window.electronAPI.onModAdded((_event, mod) => {
//   console.log("Added", value)
//   // createModItem(
//   //     mod["id"],
//   //     mod["name"],
//   //     mod["description"],
//   //     mod["version"],
//   //     mod["authors"].join(", "),
//   //     mod["contact"]["homepage"],
//   //     null,
//   //     mod["finalIconPath"],
//   //     true
//   // )
// })

// window.electronAPI.onModChanged((_event, value) => {
//   console.log("Changed", value)
// })

// window.electronAPI.onModRemoved((_event, value) => {
//   console.log("Removed", value)
// })
