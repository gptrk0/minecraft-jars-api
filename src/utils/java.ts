export const getJavaExecutableByClassVersion = ([min_class_ver, max_class_ver]: [number, number]): string | null => {
    let availableVersions = [
        { java_version: 8,  class_version: 52 },
        { java_version: 16, class_version: 60 },
        { java_version: 17, class_version: 61 },
        { java_version: 21, class_version: 65 },
        { java_version: 25, class_version: 69 }
    ];

    for (let v of availableVersions) {
        if (v.class_version >= min_class_ver && v.class_version <= max_class_ver) {
            return `/home/node/java/${v.java_version}/bin/java`;
        }
    }

    return null;
}
