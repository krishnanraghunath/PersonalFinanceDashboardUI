
class commonUtils {

    static titleCase = (input) => {
        if (input == undefined) return ''
        input = input.replaceAll('_',' ')
        let titleCase = input.toLowerCase().split(' ')
        for (var i = 0; i < titleCase.length; i++) {
            titleCase[i] = titleCase[i].charAt(0).toUpperCase() + titleCase[i].slice(1); 
        }
        return titleCase.join(' ')
    }

    static getRandomAlphabetString = (length) => {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";    
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
}

export default commonUtils