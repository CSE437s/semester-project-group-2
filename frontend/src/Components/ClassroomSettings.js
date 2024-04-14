import { useEffect, useState } from "react"
import { getClassroomSettings, setClassroomSettings } from "../UserUtils"

const ClassroomSettings = () => {
    const [settings, setSettings] = useState({queueEnabled: false, passwordEnabled: false, password: undefined})
    const [originallyHadAPassword, setOriginallyHadAPassword] = useState(false)
    const [savedNewSettings, setSavedNewSettings] = useState(true)
    useEffect(() => {
        if(savedNewSettings === true) {
            setSavedNewSettings(false)
            getClassroomSettings().then(oldSettings => {
                setSettings(oldSettings)
                if(oldSettings.passwordEnabled === true) {
                    setOriginallyHadAPassword(true)
                }
                else {
                    setOriginallyHadAPassword(false)
                }
            })
        }
    }, [savedNewSettings]) // only run on component mount

    const handleSettingsChange = (e) => {
        e.preventDefault()
        if(settings.passwordEnabled === true && !settings.password)  {
            alert("Please enter a room password to continue.")
            return
        }
        const newSettings = {
            queueEnabled: settings.queueEnabled,
            passwordEnabled: settings.passwordEnabled,
            password: settings.passwordEnabled === true ? settings.password : undefined
        }
        setClassroomSettings(newSettings).then(result => {
            alert("Settings changed successfully!")
            setSavedNewSettings(true)
        })
    }
    return (<>
    <form onSubmit={handleSettingsChange}>
        <div>
            <label htmlFor="queue">Enable Queue</label>
            <input id="queue" type="checkbox" checked={settings.queueEnabled === true} onChange={(e)=>{
                setSettings({queueEnabled: e.target.checked, passwordEnabled: settings.passwordEnabled, password: settings.password})
                }
            }/>
        </div>
        <div>
            <label htmlFor="password-protected">Password protected room</label>
            <input id="password-protected" type="checkbox" checked={settings.passwordEnabled === true} onChange={(e)=>{
                setSettings({queueEnabled: settings.queueEnabled, passwordEnabled: e.target.checked, password: settings.password})
            }
            } />
            {settings.passwordEnabled === true && <div>
                {originallyHadAPassword === true ? "Reset your room password:" : "Room Password:" }
                <input className="bg-slate-500" id="password" autoComplete="new-password" type="password" onChange={(e)=>
                    setSettings({queueEnabled: settings.queueEnabled, passwordEnabled: settings.passwordEnabled, password: e.target.value})
                    }/>
                </div>
            }
        </div>
        <input type="submit" />
    </form>
    
    </>)
}

export default ClassroomSettings