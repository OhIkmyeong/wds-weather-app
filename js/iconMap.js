export const ICON_MAP = new Map();

function add_map(values,name){
    values.forEach(val => {
        ICON_MAP.set(val,name);
    });
}//add_map

add_map([0,1], "sun");
add_map([2], "cloud-sun");
add_map([3], "cloud");
add_map([45,48], "smog");
add_map([51,53,55,56,57,61,63,65,66,67,80,81,82], "cloud-showers-heavy");
add_map([71,73,75,77,85,86], "snow");
add_map([95,96,99], "cloud-bold");