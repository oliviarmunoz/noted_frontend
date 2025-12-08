import { musicDiscovery } from "../api/api.js";

/**
 * Composable for loading music entity details
 */
export function useEntities() {
  /**
   * Load entity details by external ID (Spotify ID)
   * @param {string} externalId - The external ID (Spotify ID) of the entity
   * @returns {Promise<{name: string, artist: string, uri: string, item: string}>}
   */
  const loadEntityByExternalId = async (externalId) => {
    try {
      console.log(`[useEntities] Loading entity by externalId: ${externalId}`);

      const entity = await musicDiscovery.getEntityFromId(externalId);

      if (entity && entity.error) {
        console.error(
          `[useEntities] Error loading entity ${externalId}:`,
          entity.error
        );
        return { item: externalId, name: "Unknown", artist: "", uri: "" };
      }

      // Extract musicEntity from response
      let musicEntity = null;
      if (Array.isArray(entity) && entity.length > 0) {
        musicEntity = entity[0].musicEntity || entity[0];
      } else if (entity.musicEntity) {
        musicEntity = entity.musicEntity;
      } else if (entity._id || entity.name) {
        // Response might be the entity directly
        musicEntity = entity;
      }

      if (musicEntity) {
        console.log(`[useEntities] Successfully loaded entity:`, {
          name: musicEntity.name,
          artist: musicEntity.artistName,
          uri: musicEntity.uri,
          _id: musicEntity._id,
          externalId: musicEntity.externalId,
          externalURL: musicEntity.externalURL,
        });

        return {
          item: externalId,
          name: musicEntity.name || "Unknown",
          artist: musicEntity.artistName || "",
          uri: musicEntity.uri || "",
          imageUrl: musicEntity.imageUrl || null,
          externalURL: musicEntity.externalURL || null,
        };
      }

      console.warn(
        `[useEntities] No musicEntity found in response for ${externalId}:`,
        entity
      );
      return {
        item: externalId,
        name: "Unknown",
        artist: "",
        uri: "",
        imageUrl: null,
      };
    } catch (error) {
      console.error(
        `[useEntities] Exception loading item ${externalId}:`,
        error
      );
      return {
        item: externalId,
        name: "Unknown",
        artist: "",
        uri: "",
        imageUrl: null,
      };
    }
  };

  /**
   * Load entity details by URI
   * @param {string} uri - The Spotify URI of the entity
   * @returns {Promise<Object>}
   */
  const loadEntityByUri = async (uri) => {
    try {
      const entity = await musicDiscovery.getEntityFromUri(uri);

      if (entity && entity.error) {
        return null;
      }

      // Extract musicEntity from response
      let musicEntity = null;
      if (Array.isArray(entity) && entity.length > 0) {
        musicEntity = entity[0].musicEntity;
      } else if (entity.musicEntity) {
        musicEntity = entity.musicEntity;
      } else {
        musicEntity = entity;
      }

      return musicEntity;
    } catch (error) {
      console.error(`[useEntities] Error loading entity by URI ${uri}:`, error);
      return null;
    }
  };

  return {
    loadEntityByExternalId,
    loadEntityByUri,
  };
}
