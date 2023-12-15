import configData from "../config.json"
/*
State of elements basically true/false can be set using this one
Usage -> stateUtil.setState(reference,stateSet,stateName)
*/
class stateUtil {

    static setState = (referenceElement,stateGroup,stateName,extraElements) => {
        let state = configData.STATE_CONFIG[stateGroup][stateName]
        referenceElement.setState(stateUtil.addMap(state,extraElements))
    };

    static addMap = (currentMap,overrideMap) => {
        if (overrideMap == null)
            overrideMap = {}
        Object.entries(overrideMap).forEach(kv => {
            currentMap[kv[0]] = kv[1]
        })
        return currentMap
    }
    
    static enable = (referenceElement,element,extraElements) => {
        let currentState = referenceElement.state[element]
        currentState.disabled = false 
        referenceElement.setState(stateUtil.addMap(currentState,extraElements))
    };

    static disable = (referenceElement,element,extraElements) => {
        let currentState = referenceElement.state[element]
        currentState.disabled = true
        referenceElement.setState(stateUtil.addMap(currentState,extraElements))
    };

}

export default stateUtil;