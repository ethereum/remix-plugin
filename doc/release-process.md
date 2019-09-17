To release a new version :
1. Delete `index.js` in `projects/{ project }/dist`
2. Update version in `projects/{ project }/package.json`
3. On root folder run `npm run build`
4. On root folder run `npm run publish`
5. Commit package.json with commit message `v{ new version }` (e.g.: `v0.1.16`)