declare module "find-free-port" {
  export default function findFreePort(port?: number): Promise<[number]>;
}
