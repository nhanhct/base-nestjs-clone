export class TextHelper{
    static randomInteger(min, max)
    {
        return  Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static randomNumericCharacters(length)
    {
        let result = '';
        let characters = '0123456789';
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result
    }
    static containsUppercase(text)
    {
        return /[a-z]/.test(text);
    }
    static containsNumber(text)
    {
        return /\d/.test(text);
    }
    static containsSpecial(text)
    {
        return /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(text);
    }
}