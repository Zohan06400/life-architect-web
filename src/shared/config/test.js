export const TEST_MODE = true;

export const logTestEvent = (event, data) => {
    if (TEST_MODE) {
        console.group(`🧪 TEST EVT: ${event}`);
        console.log(data);
        console.groupEnd();
    }
};
