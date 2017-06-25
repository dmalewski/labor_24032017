    const { MongoClient } = require('mongodb');

    const getHunde = async (page = 0, countPerPage = 8) => {

    const db = await MongoClient.connect(`mongodb://dmalewski:1234@ds163711.mlab.com:63711/ifi_tierheim`);

    const collection = db.collection('dogs');

    const dogsCount = await collection.count();

    const pagesCount = dogsCount/countPerPage;

    console.log("Hunde:" + dogsCount);

    console.log("countPerPage:" + countPerPage);

    console.log("Seiten:" + pagesCount);

    const hunde = await collection
      .find({})
      .skip(page * countPerPage)
      .limit(countPerPage)
      .toArray();


    await db.close();

    return {
      pagesCount,
      hunde
    };
};

module.exports.getHunde = getHunde;
