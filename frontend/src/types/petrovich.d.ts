/** Minimal typings for the CJS-only `petrovich` package (no bundled types). */
declare module "petrovich" {
  type Gender = "male" | "female" | "androgynous";
  type GrammaticalCase =
    | "nominative"
    | "genitive"
    | "dative"
    | "accusative"
    | "instrumental"
    | "prepositional";

  interface Person {
    first?: string;
    last?: string;
    middle?: string;
    gender?: Gender;
  }

  /** Returns a new Person with the requested case applied to present fields. */
  function petrovich(person: Person, grammaticalCase: GrammaticalCase): Person;

  export = petrovich;
}
