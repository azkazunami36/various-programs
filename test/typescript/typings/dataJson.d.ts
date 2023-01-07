declare module "~/data/data.json" {
    interface database {
        ytdlRawInfoData: {
            title: string;
            description: string;
        };
        ytchRawInfoData: {
            author: {
                id: string
            }
        }
    }
    const data: database;

    export default data;
}
