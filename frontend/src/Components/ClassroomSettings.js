import { useEffect, useState } from "react"
import { getClassroomSettings, setClassroomSettings } from "../UserUtils"

const ClassroomSettings = () => {
    const [settings, setSettings] = useState({ queueEnabled: false, instructorsAllowed: true, passwordEnabled: false, password: undefined })
    const [originallyHadAPassword, setOriginallyHadAPassword] = useState(false)
    const [savedNewSettings, setSavedNewSettings] = useState(true)
    const [showForm, setShowForm] = useState(false)
    useEffect(() => {
        if (savedNewSettings === true) {
            setSavedNewSettings(false)
            getClassroomSettings().then(oldSettings => {
                setSettings(oldSettings)
                if (oldSettings.passwordEnabled === true) {
                    setOriginallyHadAPassword(true)
                }
                else {
                    setOriginallyHadAPassword(false)
                }
            })
        }
    }, [savedNewSettings]) // only when settings have been saved

    const handleSettingsChange = (e) => {
        e.preventDefault()
        if (settings.passwordEnabled === true && !settings.password) {
            alert("Please enter a room password to continue.")
            return
        }
        const newSettings = {
            queueEnabled: settings.queueEnabled,
            instructorsAllowed: settings.instructorsAllowed,
            passwordEnabled: settings.passwordEnabled,
            password: settings.passwordEnabled === true ? settings.password : undefined
        }
        setClassroomSettings(newSettings).then(result => {
            if (result === true) {
                alert("Settings changed successfully!")
                setSavedNewSettings(true)
                setShowForm(false)
            }
        })
    }
    return (<>
        {showForm === true ?
            <>
                <button onClick={() => setShowForm(!showForm)} className="hover:animate-spin-short absolute right-5 bg-settings p-6 bg-no-repeat bg-cover m-2 mt-2"></button>
                <form onSubmit={handleSettingsChange} className="mt-2 mr-6 w-fit rounded-lg shadow-md rounded px-8 pt-6 pb-8 bg-indigo-300">
                    <div className="mb-1">
                        <input id="queue" type="checkbox" checked={settings.queueEnabled === true} onChange={(e) => {
                            setSettings({ queueEnabled: e.target.checked, instructorsAllowed: settings.instructorsAllowed, passwordEnabled: settings.passwordEnabled, password: settings.password })
                        }
                        } className="mr-2 accent-indigo-700" />
                        <label htmlFor="queue">Enable Queue</label>

                    </div>
                    <div className="mb-1">
                        <input id="queue" type="checkbox" checked={settings.instructorsAllowed === true} onChange={(e) => {
                            setSettings({ queueEnabled: settings.queueEnabled, instructorsAllowed: e.target.checked, passwordEnabled: settings.passwordEnabled, password: settings.password })
                        }
                        } className="mr-2 accent-indigo-700" />
                        <label htmlFor="queue">Allow Instructors</label>

                    </div>
                    <div className="mb-4">
                        <input id="password-protected" type="checkbox" checked={settings.passwordEnabled === true} onChange={(e) => {
                            setSettings({ queueEnabled: settings.queueEnabled, instructorsAllowed: settings.instructorsAllowed, passwordEnabled: e.target.checked, password: settings.password })
                        }
                        } className="mr-2 accent-indigo-700" />
                        {settings.passwordEnabled === true && <div>
                            {originallyHadAPassword === true ? "Reset your room password:" : "Room Password:"}
                            <input id="password" type="text" onChange={(e) =>
                                setSettings({ queueEnabled: settings.queueEnabled, instructorsAllowed: settings.instructorsAllowed, passwordEnabled: settings.passwordEnabled, password: e.target.value })
                            } className="mr-2 rounded focus:bg-slate-100 focus:border-0 p-1" />
                        </div>
                        }
                        <label htmlFor="password-protected">Enable Password</label>

                    </div>
                    <input type="submit" className="px-3 py-2 bg-indigo-500 rounded text-white hover:bg-indigo-700 hover:cursor-pointer" />
                </form>

            </>
            :
            <button onClick={() => setShowForm(!showForm)} value="clear" className="hover:animate-spin-back bg-settings p-6 bg-no-repeat bg-cover m-2 mt-0"></button>
        }

    </>)
}

export default ClassroomSettings