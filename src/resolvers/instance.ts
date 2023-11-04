import nurlresolver from "nurlresolver"
export const resolve = async (u: string) => {
    const result = await nurlresolver.resolveRecursive(u);
    return result;
}