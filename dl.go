package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"regexp"
	"runtime"
	"strings"
	"sync"

	"github.com/PuerkitoBio/goquery"
	"github.com/google/go-cmp/cmp"
	"github.com/pkg/errors"
)

func main() {
	fmt.Println("err:", dl())
}

func dl() error {
	//const wiki_url = "https://en.wikipedia.org/wiki/List_of_cocktails"
	const wiki_url = "https://en.wikipedia.org/wiki/List_of_IBA_official_cocktails"
	doc, err := goquery.NewDocument(wiki_url)
	if err != nil {
		return errors.Wrap(err, "download main")
	}
	urlch := make(chan string)
	go func() {
		defer close(urlch)
		seen := map[string]bool{}
		doc.Find("#mw-content-text .div-col a[title]").Each(func(i int, s *goquery.Selection) {
			n := s.Get(0)
			for _, a := range n.Attr {
				if a.Key == "href" {
					u := "https://en.wikipedia.org" + a.Val
					if !seen[u] {
						seen[u] = true
						urlch <- u
					}
				}
			}
		})
	}()
	var wg sync.WaitGroup
	wg.Add(1)
	ctch := make(chan CT)
	go func() {
		defer close(ctch)
		defer wg.Done()
		for u := range urlch {
			doc, err := goquery.NewDocument(u)
			if err != nil {
				panic(err)
			}
			doc.Find("table.infobox").Each(func(i int, s *goquery.Selection) {
				cap := s.Find("* > caption").Text()
				if cap == "" {
					return
				}
				var greds, short []string
				var details [][]string
				s.Find("tbody > tr").Each(func(i int, tr *goquery.Selection) {
					th := strings.ToLower(strings.TrimSpace(tr.Find("th").Text()))
					td := strings.TrimSpace(tr.Find("td").Text())
					if th == "" || td == "" {
						return
					}
					if strings.Contains(th, "ingredients") {
						if len(greds) != 0 {
							panic(u)
						}
						tr.Find("td > ul > li").Each(func(i int, li *goquery.Selection) {
							g := strings.TrimSpace(li.Text())
							if g != "" {
								greds = append(greds, g)
							}
						})
						short = make([]string, len(greds))
						for i, s := range greds {
							for {
								s = strings.ToLower(strings.TrimSpace(strings.TrimLeft(s, " +–0123456789./½¾⅔")))
								s = strings.TrimRight(s, ".")
								changed := false
								for _, m := range measurements {
									m += " "
									if strings.HasPrefix(strings.ToLower(s), m) {
										s = strings.TrimSpace(s[len(m):])
										changed = true
									}
									if strings.HasPrefix(s, "of ") {
										s = s[3:]
										changed = true
									}
								}
								ns := strings.Join(strings.Fields(strings.Join(parenRE.Split(s, -1), " ")), " ")
								for _, e := range endings {
									ns = strings.TrimSuffix(ns, e)
								}
								if ns != s {
									changed = true
									s = ns
								}
								if !changed {
									break
								}
							}
							if s == "" {
								fmt.Println("no short", greds[i], cap, u)
							}
							if strings.HasSuffix(s, " bitter") {
								s += "s"
							}
							if ns, ok := replacements[s]; ok {
								s = ns
							}
							short[i] = s
						}
						return
					}
					details = append(details, []string{th, td})
				})
				if len(greds) == 0 {
					return
				}
				cap = strings.TrimSuffix(cap, " (cocktail)")
				ct := CT{
					Name:       cap,
					Link:       u,
					//Details:    details,
					Greds:      greds,
					ShortGreds: short,
				}
				ctch <- ct
			})
		}
	}()
	cts := map[string]CT{}
	for i := 0; i < runtime.NumCPU(); i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			seen := map[string]bool{}
			for ct := range ctch {
				if prev, ok := cts[ct.Name]; ok {
					if !cmp.Equal(ct.Greds, prev.Greds) {
						fmt.Println("unmatching", ct.Name, prev.Link, ct.Link)
					}
					continue
				}
				cts[ct.Name] = ct
				for _, s := range ct.ShortGreds {
					s = strings.ToLower(s)
					if !seen[s] {
						//fmt.Println(s, ct.Link, ct.Name)
						seen[s] = true
					}
				}
			}
		}()
	}
	wg.Wait()
	b, _ := json.MarshalIndent(cts, "", "  ")
	return ioutil.WriteFile("src/drinks.json", b, 0666)
}

var (
	measurements = []string{
		"one",
		"two",
		"three",

		"cl",
		"ml",
		"dashes",
		"dash",
		"drops",
		"each",
		"fresh",
		"freshly squeezed",
		"oz.",
		"oz",
		"ounces",
		"ounce",
		"parts",
		"part",
		"pint",
		"shot",
		"slice",
		"slices",
		"tbsp",
		"teaspoons",
		"teaspoon",
		"top with",
		"us fluid ounces",
		"us fluid ounce",
		"cpu",
		"sprig",
		"measure",
		"tsp",
		"to",
		"garnish",
		"a splash",
		"splash",
		"or",
		"few",
		"a pinch",
		"pinch",
		"half a",
		"half",
		"slice",
		"bar spoons",
		"plain",
		"barspoon",
	}
	parenRE      = regexp.MustCompile(`\(.*?\)`)
	replacements = map[string]string{
		"grenadine syrup":        "grenadine",
		"kahlua":                 "kahlúa",
		"red vermouth":           "sweet vermouth",
		"soda water":             "carbonated water",
		"sugar syrup":            "simple syrup",
		"sweet red vermouth":     "sweet vermouth",
		"white vermouth":         "dry vermouth",
		"amaretto liqueur":       "amaretto",
		"creme de mure":          "crème de mûre",
		"creme de violette":      "crème de violette",
		"scotch whisky":          "scotch",
		"bourbon whiskey":        "bourbon",
		"bourbon or rye whiskey": "whiskey",
		"rye whiskey":            "rye",
	}
	endings = []string{
		"cut into 4 wedges",
		", fresh",
		"finely chopped",
	}
)

type CT struct {
	Name string
	Link string
	//Details    [][]string
	Greds      []string
	ShortGreds []string
}
