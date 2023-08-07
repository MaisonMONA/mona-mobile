<template>
    <div></div>
</template>

<script>
import {Directory, Filesystem} from "@capacitor/filesystem";

export default {
    name: "DeleteAllData",
    mounted() {
        Promise.allSettled([
            Filesystem.deleteFile({
                path: "appdata/preferences.json",
                directory: Directory.Data
            }),
            Filesystem.deleteFile(({
                path: "appdata/populateDataBase.json",
                directory: Directory.Data
            })),
            Filesystem.deleteFile({
                path: "appdata/artworks.json",
                directory: Directory.Data
            }),
            Filesystem.deleteFile({
                path: "appdata/heritages.json",
                directory: Directory.Data
            }),
            Filesystem.deleteFile({
                path: "appdata/badges.json",
                directory: Directory.Data
            }),
            Filesystem.deleteFile({
                path: "appdata/places.json",
                directory: Directory.Data
            }),
            Filesystem.deleteFile({
                path: "discoveries_sorted.json",
                directory: Directory.Cache,
            })
        ]).then(() => {
            console.log("deleted");
            this.$router.push("/");
        })
            .catch((err) => console.log(err));
    }
}
</script>

<style scoped>

</style>
