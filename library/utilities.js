export const coerceAsReader = resource => {

  return {
    read(_array) {
      if (resource.hasOwnProperty("rid")) return Deno.read(resource.rid, _array);

      let index = 0;

      for (; index < _array.length; index++) {
        if (resource.raw.length > index) {
          _array[index] = resource.raw[index];
          resource.raw[index] = 0;
        }
      }

      return Promise.resolve(index);
    },
    ...resource
  };
};

export const coerceAsWriter = resource => {

  return {
    write(_array) {
      if (resource.hasOwnProperty("rid")) return Deno.write(resource.rid, _array);

      resource.raw = new Uint8Array([ ...resource.raw, ..._array ]);

      return Promise.resolve(_array.length);
    },
    ...resource
  };
};