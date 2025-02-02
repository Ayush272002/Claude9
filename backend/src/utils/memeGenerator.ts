import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || "",
});

export async function generateMeme(topic: string): Promise<string> {
    const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Generate a meme about the following situation: "${topic}".
              
              Use this list of meme templates:
    
              aag, ackbar, afraid, agnes, aint-got-time, ams, ants, apcr, astronaut, atis, away, awesome, awesome-awkward, awkward, awkward-awesome, bad, badchoice, bd, because, bender, bihw, bilbo, biw, blb, boat, bongo, both, box, bs, buzz, cake, captain, captain-america, cb, cbg, center, ch, chair, cheems, chosen, cmm, country, crazypills, crow, cryingfloor, db, dbg, dg, disastergirl, dodgson, doge, dragon, drake, drowning, drunk, ds, dsm, dwight, elf, elmo, ermg, exit, fa, facepalm, fbf, feelsgood, fetch, fine, firsttry, fmr, fry, fwp, gandalf, gb, gears, genie, ggg, glasses, gone, grave, gru, grumpycat, hagrid, happening, harold, headaches, hipster, home, icanhas, imsorry, inigo, interesting, ive, iw, jd, jetpack, jim, joker, jw, keanu, kermit, khaby-lame, kk, kombucha, kramer, leo, light, live, ll, lrv, made, mb, michael-scott, millers, mini-keanu, mmm, money, mordor, morpheus, mouth, mw, nails, nice, noah, noidea, ntot, oag, officespace, older, oprah, panik-kalm-panik, patrick, perfection, persian, philosoraptor, pigeon, pooh, ptj, puffin, red, regret, remembers, reveal, right, rollsafe, sad-biden, sad-boehner, sad-bush, sad-clinton, sad-obama, sadfrog, saltbae, same, sarcasticbear, sb, scc, seagull, sf, sk, ski, slap, snek, soa, sohappy, sohot, soup-nazi, sparta, spiderman, spongebob, ss, stew, stonks, stop, stop-it, success, tenguy, toohigh, touch, tried, trump, ugandanknuck, vince, waygd, wddth, whatyear, winter, wkh, woman-cat, wonka, worst, xy, yallgot, yodawg, yuno, zero-wing
    
              Respond only with the final meme image URL using this format:
              https://api.memegen.link/images/<MEME_KEY>/<TOP_TEXT>/<BOTTOM_TEXT>.jpg
              
              Format the text properly for a URL and choose the best meme template that fits the situation.`,
          },
        ],
    });
    
    // @ts-ignore
    const memeUrl = message.content[0]?.text?.trim();
    return memeUrl;
}